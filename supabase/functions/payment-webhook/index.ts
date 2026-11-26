// Webhook de pagamento — Kiwify.
// Regras: valida a assinatura no servidor, grava o evento uma única vez (idempotência)
// e só libera acesso com compra aprovada. Reembolso e chargeback bloqueiam o acesso.
//
// Kiwify: envia POST para a URL cadastrada com ?signature=<HMAC-SHA1 hex do corpo bruto>,
// usando o token do webhook como chave. Configure o segredo KIWIFY_TOKEN com esse token.
// Opcional: KIWIFY_PRODUCT_ID para aceitar só vendas desse produto.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const APP_URL = "https://ceia-natal-beta.vercel.app/";

// E-mail de compra aprovada, enviado pelo Gmail da equipe.
// Segredos: GMAIL_USER (o endereço) e GMAIL_APP_PASSWORD (senha de app do Google).
async function sendApprovedEmail(to: string) {
  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) return "sem-config";
  const text = `Olá! 🎄

Sua compra do CEIA FÁCIL foi confirmada!

Agora você já pode começar a organizar sua ceia de Natal de maneira prática e sem complicação.

Para acessar seu aplicativo:

1. Acesse: ${APP_URL}
2. Informe o mesmo e-mail utilizado na compra.
3. Crie sua senha de acesso.

Pronto! Sua ceia está nas suas mãos!

Bom proveito e uma excelente ceia! ❤️

Equipe CEIA FÁCIL`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1b2a22;line-height:1.6">
  <div style="background:#0f2a1f;color:#fdfaf3;padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
    <div style="font-family:Georgia,serif;font-size:26px">ceia<span style="color:#dcb96a">.</span>fácil</div>
  </div>
  <div style="background:#fdfaf3;padding:28px 24px;border:1px solid #efe3cc;border-top:0;border-radius:0 0 16px 16px">
    <p style="font-size:18px;margin:0 0 12px">Olá! 🎄</p>
    <p style="margin:0 0 12px"><b>Sua compra do CEIA FÁCIL foi confirmada!</b></p>
    <p style="margin:0 0 18px">Agora você já pode começar a organizar sua ceia de Natal de maneira prática e sem complicação.</p>
    <p style="margin:0 0 8px"><b>Para acessar seu aplicativo:</b></p>
    <ol style="margin:0 0 22px;padding-left:20px">
      <li>Acesse o app pelo botão abaixo;</li>
      <li>Informe o <b>mesmo e-mail utilizado na compra</b>;</li>
      <li>Toque em <b>Primeiro acesso</b> e crie sua senha.</li>
    </ol>
    <p style="text-align:center;margin:0 0 22px"><a href="${APP_URL}" style="display:inline-block;background:#dcb96a;color:#0a1f16;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Acessar o CEIA FÁCIL</a></p>
    <p style="margin:0 0 12px">Pronto! Sua ceia está nas suas mãos!</p>
    <p style="margin:0">Bom proveito e uma excelente ceia! ❤️<br><b>Equipe CEIA FÁCIL</b></p>
  </div>
</div>`;
  const client = new SMTPClient({ connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: user, password: pass } } });
  try {
    await client.send({ from: `CEIA FÁCIL <${user}>`, to, subject: "Sua compra do CEIA FÁCIL foi aprovada!", content: text, html });
    return "enviado";
  } finally {
    await client.close();
  }
}

const PRODUCT_ID = "ceia-facil-2026";

type EventType = "approved" | "refunded" | "chargeback" | "other";

async function hmacHex(secret: string, raw: string, hash: "SHA-1" | "SHA-256") {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  return Array.from(mac, (x) => x.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// deno-lint-ignore no-explicit-any
const pick = (o: any, ...paths: string[]): string | null => {
  for (const p of paths) {
    const v = p.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), o);
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return null;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const raw = await req.text();
  const token = Deno.env.get("KIWIFY_TOKEN");
  const signature = (new URL(req.url).searchParams.get("signature") ?? "").toLowerCase();
  if (!token || !signature || !safeEqual(await hmacHex(token, raw, "SHA-1"), signature))
    return new Response("invalid signature", { status: 401 });

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const orderId = pick(body, "order_id", "id");
  const eventName = pick(body, "webhook_event_type") ?? "";
  const status = pick(body, "order_status") ?? "";
  const email = pick(body, "Customer.email", "customer.email", "Customer.Email")?.toLowerCase() ?? null;
  const kiwifyProduct = pick(body, "Product.product_id", "product.product_id", "Product.id", "product_id");
  if (!orderId) return new Response("missing order id", { status: 400 });

  const type: EventType =
    eventName === "order_approved" || status === "paid" ? "approved"
    : eventName === "order_refunded" || status === "refunded" ? "refunded"
    : eventName === "chargeback" || status === "chargedback" ? "chargeback"
    : "other";

  const only = Deno.env.get("KIWIFY_PRODUCT_ID");
  const productOk = !only || only === kiwifyProduct;

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  // Idempotência: o mesmo evento reenviado não é processado duas vezes.
  const { data: inserted, error } = await db
    .from("payment_events")
    .upsert(
      { provider: "kiwify", provider_event_id: `${orderId}:${eventName || status}`, event_type: type, email, product_id: kiwifyProduct, payload: body },
      { onConflict: "provider,provider_event_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (error) return new Response("db error", { status: 500 });
  if (!inserted) return new Response("duplicate", { status: 200 });

  if (email && productOk) {
    const now = new Date().toISOString();
    if (type === "approved") {
      await db.from("entitlements").upsert(
        { email, product_id: PRODUCT_ID, status: "active", source_event_id: inserted.id, updated_at: now },
        { onConflict: "email,product_id" },
      );
      try {
        const r = await sendApprovedEmail(email);
        console.log("email compra aprovada:", r);
      } catch (e) {
        console.error("falha ao enviar e-mail:", e);
      }
    } else if (type === "refunded" || type === "chargeback") {
      await db.from("entitlements").update({ status: "revoked", source_event_id: inserted.id, updated_at: now })
        .eq("email", email).eq("product_id", PRODUCT_ID);
    }
  }
  await db.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", inserted.id);
  return new Response("ok", { status: 200 });
});

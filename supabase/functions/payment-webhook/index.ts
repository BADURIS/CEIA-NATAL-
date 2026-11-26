// Webhook de pagamento — Kiwify.
// Regras: valida a assinatura no servidor, grava o evento uma única vez (idempotência)
// e só libera acesso com compra aprovada. Reembolso e chargeback bloqueiam o acesso.
//
// Kiwify: envia POST para a URL cadastrada com ?signature=<HMAC-SHA1 hex do corpo bruto>,
// usando o token do webhook como chave. Configure o segredo KIWIFY_TOKEN com esse token.
// Opcional: KIWIFY_PRODUCT_ID para aceitar só vendas desse produto.
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    } else if (type === "refunded" || type === "chargeback") {
      await db.from("entitlements").update({ status: "revoked", source_event_id: inserted.id, updated_at: now })
        .eq("email", email).eq("product_id", PRODUCT_ID);
    }
  }
  await db.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", inserted.id);
  return new Response("ok", { status: 200 });
});

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Sparkles } from "../lib/icons";
import { CHECKOUT_URL, useAuth } from "../lib/auth";
import { Logo } from "./ui";

/** Protege o app: só quem entrou com o e-mail da compra aprovada vê o conteúdo. */
export default function AccessGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "liberado") return <>{children}</>;
  return (
    <div className="min-h-screen bg-cream-100 lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative h-72 overflow-hidden bg-pine-900 sm:h-80 lg:sticky lg:top-0 lg:h-screen">
        <img src="fotos/peru-assado-tradicional.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-900 via-pine-900/40 to-pine-900/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 pb-14 sm:p-10 sm:pb-16 lg:pb-10">
          <Logo light />
          <p className="mt-3 max-w-md font-display text-[1.45rem] leading-snug text-cream-50 sm:text-3xl lg:text-4xl">
            Sua ceia de Natal planejada, do cardápio à lista de compras.
          </p>
          <p className="mt-2 hidden text-cream-100/80 lg:block">Receitas com a quantidade certa para cada convidado.</p>
        </div>
      </aside>
      <main className="relative z-10 -mt-8 flex flex-col justify-center px-4 pb-14 sm:px-8 lg:mt-0 lg:min-h-screen lg:py-12">
        <div className="mx-auto w-full max-w-md">
          {status === "carregando" && <div className="card p-8 text-center text-pine-700">Verificando seu acesso…</div>}
          {status === "sem-config" && (
            <Box title="Acesso em configuração" text="O login ainda não foi ligado neste site. Volte em instantes." />
          )}
          {status === "deslogado" && <LoginForm />}
          {status === "sem-acesso" && <NoAccess />}
        </div>
      </main>
    </div>
  );
}

function Box({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="card animate-rise p-6 sm:p-8">
      <h1 className="font-display text-2xl text-pine-800">{title}</h1>
      <p className="mt-2 text-pine-700/80">{text}</p>
      {children}
    </div>
  );
}

function NoAccess() {
  const { email, signOut, recheck } = useAuth();
  return (
    <Box
      title="Compra não encontrada"
      text={`Não achamos um pagamento aprovado para ${email ?? "este e-mail"}. Use o mesmo e-mail da compra. Se pagou agora, o Pix pode levar alguns minutos para ser confirmado.`}
    >
      <div className="mt-6 space-y-3">
        {CHECKOUT_URL && (
          <a href={CHECKOUT_URL} className="btn-gold w-full justify-center">
            <Sparkles className="h-4 w-4" /> Comprar acesso
          </a>
        )}
        <button onClick={recheck} className="btn-ghost w-full justify-center">Já paguei, verificar de novo</button>
        <button onClick={signOut} className="w-full text-sm text-pine-700 underline">Entrar com outro e-mail</button>
      </div>
    </Box>
  );
}

type Mode = "entrar" | "criar" | "esqueci";

export function LoginForm() {
  const { signIn, signUp, recover } = useAuth();
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "entrar") await signIn(email, password);
      else if (mode === "criar") {
        const r = await signUp(email, password);
        if (r === "confirmar-email") setMsg({ ok: true, text: "Enviamos um link para seu e-mail. Abra para confirmar e depois entre aqui." });
      } else {
        await recover(email);
        setMsg({ ok: true, text: "Se o e-mail tiver conta, enviamos um link para criar uma nova senha." });
      }
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, [string, string]> = {
    entrar: ["Entrar", "Use o e-mail que você informou na compra."],
    criar: ["Primeiro acesso", "Comprou agora? Crie sua senha com o mesmo e-mail da compra."],
    esqueci: ["Esqueci a senha", "Informe seu e-mail para receber o link de nova senha."],
  };

  return (
    <div className="card animate-rise p-6 sm:p-8">
      <p className="eyebrow flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Área de quem comprou</p>
      <h1 className="mt-1 font-display text-3xl text-pine-800">{titles[mode][0]}</h1>
      <p className="mt-1 text-pine-700/80">{titles[mode][1]}</p>

      {mode !== "esqueci" && (
        <div className="mt-5 grid grid-cols-2 rounded-full bg-cream-200 p-1 text-sm font-medium">
          {(["entrar", "criar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setMsg(null); }}
              className={`rounded-full py-2 transition ${mode === m ? "bg-white text-pine-800 shadow-soft" : "text-pine-700"}`}
            >
              {m === "entrar" ? "Já tenho senha" : "Primeiro acesso"}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          type="email" required autoComplete="email" inputMode="email" placeholder="E-mail da compra"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-pine-900/10 bg-white px-4 py-3 outline-none focus:border-pine-700"
        />
        {mode !== "esqueci" && (
          <div className="relative">
            <input
              type={show ? "text" : "password"} required minLength={6}
              autoComplete={mode === "criar" ? "new-password" : "current-password"}
              placeholder={mode === "criar" ? "Crie uma senha (mín. 6 caracteres)" : "Senha"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-pine-900/10 bg-white px-4 py-3 pr-12 outline-none focus:border-pine-700"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Esconder senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-pine-700">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        )}
        {msg && <p className={`rounded-2xl px-4 py-3 text-sm ${msg.ok ? "bg-pine-800/5 text-pine-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
          {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar senha e entrar" : "Enviar link"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === "esqueci" ? (
          <button onClick={() => { setMode("entrar"); setMsg(null); }} className="text-pine-700 underline">Voltar para entrar</button>
        ) : (
          <button onClick={() => { setMode("esqueci"); setMsg(null); }} className="text-pine-700 underline">Esqueci minha senha</button>
        )}
      </div>
      {CHECKOUT_URL && (
        <p className="mt-6 border-t border-pine-900/10 pt-4 text-center text-sm text-pine-700/80">
          Ainda não comprou? <a href={CHECKOUT_URL} className="font-semibold text-pine-800 underline">Garanta seu acesso</a>
        </p>
      )}
    </div>
  );
}

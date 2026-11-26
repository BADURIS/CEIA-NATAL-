/**
 * Login e acesso pago via Supabase (REST direto, sem SDK).
 * Regra: só entra no app quem tem compra aprovada (entitlement ativo) para o e-mail da conta.
 * O acesso é conferido no servidor pela função has_access() — o navegador nunca decide sozinho.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const CHECKOUT_URL = (import.meta.env.VITE_CHECKOUT_URL as string | undefined) || "";
export const authConfigured = Boolean(URL && KEY);

const STORAGE = "ceia-facil:sessao";

interface Session { access_token: string; refresh_token: string; expires_at: number; email: string }
type Status = "carregando" | "sem-config" | "deslogado" | "sem-acesso" | "liberado";

interface AuthState {
  status: Status;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<"logado" | "confirmar-email">;
  recover: (email: string) => Promise<void>;
  signOut: () => void;
  updatePassword: (password: string) => Promise<void>;
  recheck: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

const MSGS: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  "Invalid login credentials": "E-mail ou senha incorretos.",
  user_already_exists: "Este e-mail já tem senha criada. Use “Entrar”.",
  "User already registered": "Este e-mail já tem senha criada. Use “Entrar”.",
  email_not_confirmed: "Confirme seu e-mail pelo link que enviamos.",
  weak_password: "Senha fraca: use pelo menos 6 caracteres.",
  over_email_send_rate_limit: "Muitos e-mails enviados agora. Tente de novo em alguns minutos.",
  over_request_rate_limit: "Muitas tentativas. Aguarde um pouco e tente de novo.",
  cadastro_sem_compra: "Não encontramos compra aprovada para este e-mail. Use o mesmo e-mail da compra — se pagou agora, aguarde alguns minutos.",
  P0001: "Não encontramos compra aprovada para este e-mail. Use o mesmo e-mail da compra — se pagou agora, aguarde alguns minutos.",
  unexpected_failure: "Não encontramos compra aprovada para este e-mail. Use o mesmo e-mail da compra — se pagou agora, aguarde alguns minutos.",
  "Database error saving new user": "Não encontramos compra aprovada para este e-mail. Use o mesmo e-mail da compra — se pagou agora, aguarde alguns minutos.",
};

async function api(path: string, body: unknown, token?: string) {
  const res = await fetch(`${URL}${path}`, {
    method: "POST",
    headers: { apikey: KEY!, "Content-Type": "application/json", Authorization: `Bearer ${token ?? KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = data.error_code || data.code || data.msg || data.error_description || data.message || "";
    throw new Error(MSGS[data.message] || MSGS[code] || MSGS[data.msg] || MSGS[data.error_description] || "Não foi possível concluir. Tente de novo.");
  }
  return data;
}

function toSession(d: { access_token: string; refresh_token: string; expires_in: number; user?: { email?: string } }, fallbackEmail = ""): Session {
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: Date.now() + (d.expires_in - 60) * 1000,
    email: (d.user?.email || fallbackEmail).toLowerCase(),
  };
}

function load(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE) || "null");
    return s && s.access_token ? s : null;
  } catch {
    return null;
  }
}
function save(s: Session | null) {
  try {
    if (s) localStorage.setItem(STORAGE, JSON.stringify(s));
    else localStorage.removeItem(STORAGE);
  } catch {
    /* navegador sem armazenamento: sessão vale só nesta aba */
  }
}

async function fresh(s: Session): Promise<Session> {
  if (Date.now() < s.expires_at) return s;
  const d = await api("/auth/v1/token?grant_type=refresh_token", { refresh_token: s.refresh_token });
  const n = toSession(d, s.email);
  save(n);
  return n;
}

async function hasAccess(s: Session): Promise<boolean> {
  const res = await fetch(`${URL}/rest/v1/rpc/has_access`, {
    method: "POST",
    headers: { apikey: KEY!, "Content-Type": "application/json", Authorization: `Bearer ${s.access_token}` },
    body: "{}",
  });
  if (!res.ok) return false;
  return (await res.json()) === true;
}

/** Lê o retorno de links do Supabase (confirmação de e-mail / nova senha): #access_token=...&refresh_token=... */
function sessionFromLink(): Session | null {
  const h = window.location.hash;
  if (!h.includes("access_token=")) return null;
  const p = new URLSearchParams(h.slice(1));
  const access = p.get("access_token");
  const refresh = p.get("refresh_token");
  if (!access || !refresh) return null;
  let email = "";
  try {
    email = JSON.parse(atob(access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || "";
  } catch {
    /* ignora */
  }
  window.history.replaceState(null, "", window.location.pathname + "#conta");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  return toSession({ access_token: access, refresh_token: refresh, expires_in: Number(p.get("expires_in") || 3600) }, email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>(authConfigured ? "carregando" : "sem-config");

  const evaluate = useCallback(async (s: Session | null) => {
    if (!authConfigured) return setStatus("sem-config");
    if (!s) {
      setSession(null);
      return setStatus("deslogado");
    }
    try {
      const f = await fresh(s);
      setSession(f);
      setStatus((await hasAccess(f)) ? "liberado" : "sem-acesso");
    } catch {
      save(null);
      setSession(null);
      setStatus("deslogado");
    }
  }, []);

  useEffect(() => {
    const fromLink = authConfigured ? sessionFromLink() : null;
    if (fromLink) save(fromLink);
    evaluate(fromLink ?? load());
  }, [evaluate]);

  const signIn = async (email: string, password: string) => {
    const d = await api("/auth/v1/token?grant_type=password", { email: email.trim().toLowerCase(), password });
    const s = toSession(d, email);
    save(s);
    setStatus("carregando");
    await evaluate(s);
  };

  const signUp = async (email: string, password: string) => {
    const d = await api("/auth/v1/signup", { email: email.trim().toLowerCase(), password });
    if (!d.access_token) return "confirmar-email" as const;
    const s = toSession(d, email);
    save(s);
    setStatus("carregando");
    await evaluate(s);
    return "logado" as const;
  };

  const recover = async (email: string) => {
    await api(`/auth/v1/recover?redirect_to=${encodeURIComponent(window.location.origin)}`, { email: email.trim().toLowerCase() });
  };

  const signOut = () => {
    if (session) fetch(`${URL}/auth/v1/logout`, { method: "POST", headers: { apikey: KEY!, Authorization: `Bearer ${session.access_token}` } }).catch(() => {});
    save(null);
    setSession(null);
    setStatus(authConfigured ? "deslogado" : "sem-config");
  };

  const updatePassword = async (password: string) => {
    if (!session) throw new Error("Entre novamente para trocar a senha.");
    const s = await fresh(session);
    const res = await fetch(`${URL}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: KEY!, "Content-Type": "application/json", Authorization: `Bearer ${s.access_token}` },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(MSGS[d.error_code] || MSGS[d.msg] || "Não foi possível trocar a senha.");
    }
  };

  const recheck = async () => {
    setStatus("carregando");
    await evaluate(session ?? load());
  };

  return <Ctx.Provider value={{ status, email: session?.email ?? null, signIn, signUp, recover, signOut, updatePassword, recheck }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
};

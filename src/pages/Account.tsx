import { useState, type FormEvent } from "react";
import { Lock, User } from "../lib/icons";
import { PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";

export default function Account() {
  const { email, signOut, updatePassword } = useAuth();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const change = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updatePassword(pw);
      setPw("");
      setMsg({ ok: true, text: "Senha atualizada." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Minha conta" title="Seu acesso" subtitle="Sua ceia e sua lista ficam salvas neste aparelho." />
      <div className="card space-y-4 p-6">
        <p className="flex items-center gap-2 text-pine-800"><User className="h-5 w-5" /> {email}</p>
        <p className="rounded-2xl bg-pine-800/5 px-4 py-3 text-sm text-pine-800">Acesso liberado ✓</p>
        <form onSubmit={change} className="space-y-3 border-t border-pine-900/10 pt-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-pine-800"><Lock className="h-4 w-4" /> Trocar senha</p>
          <input
            type="password" required minLength={6} autoComplete="new-password" placeholder="Nova senha (mín. 6 caracteres)"
            value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-full border border-pine-900/10 bg-white px-4 py-3 outline-none focus:border-pine-700"
          />
          {msg && <p className={`text-sm ${msg.ok ? "text-pine-800" : "text-red-700"}`}>{msg.text}</p>}
          <button disabled={busy} className="btn-ghost w-full justify-center disabled:opacity-60">{busy ? "Salvando…" : "Salvar nova senha"}</button>
        </form>
        <button onClick={signOut} className="btn-primary w-full justify-center">Sair</button>
      </div>
    </div>
  );
}

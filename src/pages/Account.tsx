import { Lock } from "../lib/icons";
import { PageHeader } from "../components/ui";

export default function Account() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Minha conta" title="Entrar" subtitle="Login, recuperação de senha e acesso pago entram na Fase 7. Por enquanto sua ceia fica salva neste aparelho." />
      <form className="card space-y-3 p-6" onSubmit={(e) => e.preventDefault()}>
        <input disabled placeholder="Seu e-mail" className="w-full rounded-full bg-cream-100 px-4 py-3 opacity-60" />
        <input disabled type="password" placeholder="Senha" className="w-full rounded-full bg-cream-100 px-4 py-3 opacity-60" />
        <button disabled className="btn-primary w-full opacity-60"><Lock className="h-4 w-4" /> Em breve</button>
      </form>
    </div>
  );
}

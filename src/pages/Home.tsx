import { ArrowRight, CakeSlice, ChefHat, ListChecks, PiggyBank, ShoppingBasket, Sparkles, Users, Wine } from "../lib/icons";
import { Link } from "../lib/router";
import { recipes } from "../data/catalog";
import { drinks } from "../data/drinks";
import { DishVisual, Logo } from "../components/ui";

const FEATURES = [
  { icon: Users, title: "Do seu tamanho", text: "Escolha de 2 a 50+ convidados e todas as quantidades se ajustam sozinhas." },
  { icon: ShoppingBasket, title: "Lista pronta", text: "Ingredientes somados, sem repetição, organizados por seção do mercado." },
  { icon: PiggyBank, title: "Sem desperdício", text: "Vários pratos? As porções se dividem, em vez de multiplicar." },
  { icon: ChefHat, title: "Fácil de fazer", text: "Receitas simples, ingredientes acessíveis e passo a passo claro." },
];

const STEPS = [
  { n: "01", title: "Diga quantos vêm", text: "Arraste a barra ou toque no número de convidados." },
  { n: "02", title: "Monte o cardápio", text: "Salgados, sobremesas e bebidas, com um toque." },
  { n: "03", title: "Vá ao mercado", text: "Sua lista consolidada, com caixinhas para marcar no celular." },
];

export default function Home() {
  const preview = ["chester-assado", "pernil-suino-assado", "arroz-a-grega", "salpicao-de-frango", "pave-de-chocolate", "pudim-de-leite-condensado"]
    .map((id) => recipes.find((r) => r.id === id)!)
    .filter(Boolean);
  const salg = recipes.filter((r) => r.kind === "salgado").length;
  const sob = recipes.length - salg;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-pine-900 text-cream-50">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 -left-32 h-[460px] w-[460px] rounded-full bg-pine-600/60 blur-3xl" />
        <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #DCC48F 1px, transparent 0)", backgroundSize: "22px 22px" }} />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-6">
          <div className="flex items-center justify-between">
            <Logo light />
            <Link to="/conta" className="rounded-full border border-cream-50/20 px-4 py-1.5 text-sm text-cream-50/90 hover:bg-white/10">Entrar</Link>
          </div>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-300">
                <Sparkles className="h-3.5 w-3.5" /> Natal 2026
              </span>
              <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl">
                Sua ceia,<br />
                <em className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text font-medium text-transparent">do seu jeito.</em>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-cream-50/75">
                Escolha os pratos, diga quantas pessoas vêm e receba as receitas recalculadas e a lista de compras pronta. Sem conta de cabeça e sem desperdício.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/salgados" className="btn-gold text-base">
                  Montar minha ceia <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-medium text-cream-50/80 underline-offset-4 hover:underline">Como funciona</button>
              </div>
              <dl className="mt-10 flex gap-8 text-cream-50/85">
                {[[salg, "salgados"], [sob, "sobremesas"], [drinks.length, "bebidas"]].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-3xl text-gold-300">{n}</dt>
                    <dd className="text-xs uppercase tracking-widest text-cream-50/60">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Mock do app */}
            <div className="relative mx-auto w-full max-w-sm animate-rise [animation-delay:.15s]">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-400/40 to-transparent blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-cream-50 p-5 text-pine-900 shadow-2xl">
                <p className="eyebrow">Minha ceia</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-display text-xl">12 convidados</span>
                  <span className="chip bg-pine-800 text-cream-50">4 pratos</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[["Chester assado", "2 unidades"], ["Arroz à grega", "600 g de arroz"], ["Salpicão de frango", "1 kg de frango"], ["Pavê de chocolate", "2 latas de leite cond."]].map(([a, b]) => (
                    <div key={a} className="flex items-center justify-between rounded-2xl bg-cream-100 px-3.5 py-2.5 text-sm">
                      <span className="font-medium">{a}</span>
                      <span className="text-pine-700/70">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-pine-800 px-4 py-3 text-sm text-cream-50">
                  <ListChecks className="h-4 w-4 text-gold-300" /> Lista de compras gerada
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow text-center">Por que ceia.fácil</p>
        <h2 className="mx-auto mt-2 max-w-2xl text-center text-4xl text-pine-800">Uma ceia bonita, completa e sem gastar além do necessário</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pine-800 text-gold-300"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-xl text-pine-800">{f.title}</h3>
              <p className="mt-1.5 text-sm text-pine-700/80">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEW */}
      <section className="bg-cream-200/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">O cardápio</p>
              <h2 className="mt-2 text-4xl text-pine-800">Os clássicos que não podem faltar</h2>
            </div>
            <div className="flex gap-2">
              <Link to="/salgados" className="btn-ghost">Salgados</Link>
              <Link to="/sobremesas" className="btn-ghost"><CakeSlice className="h-4 w-4" />Sobremesas</Link>
              <Link to="/bebidas" className="btn-ghost"><Wine className="h-4 w-4" />Bebidas</Link>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {preview.map((r) => (
              <Link key={r.id} to={`/receita/${r.id}`} className="card group overflow-hidden">
                <DishVisual role={r.role} name={r.name} id={r.id} className="aspect-[3/2] transition duration-500 group-hover:scale-105" />
                <p className="p-4 font-display text-lg text-pine-800">{r.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow text-center">Como funciona</p>
        <h2 className="mt-2 text-center text-4xl text-pine-800">Três passos até o mercado</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-3xl border border-pine-900/10 p-7">
              <span className="font-display text-5xl text-gold-400/70">{s.n}</span>
              <h3 className="mt-3 text-2xl text-pine-800">{s.title}</h3>
              <p className="mt-1.5 text-pine-700/80">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LISTA DESTAQUE */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-pine-800 p-8 text-cream-50 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow text-gold-300">Lista de compras automática</p>
              <h2 className="mt-2 text-4xl">Tudo somado. Nada repetido.</h2>
              <p className="mt-4 text-cream-50/75">Se três receitas usam cebola, a lista mostra só uma linha com o total, arredondado para o que você encontra na prateleira. Marque, edite e compartilhe com quem vai ao mercado.</p>
            </div>
            <ul className="space-y-2 rounded-3xl bg-cream-50 p-5 text-sm text-pine-900">
              {[["Cebola", "5 unidades", true], ["Leite condensado", "3 latas", true], ["Creme de leite", "4 caixinhas", false], ["Chester", "2 unidades", false]].map(([a, b, done]) => (
                <li key={a as string} className="flex items-center gap-3 rounded-xl bg-cream-100 px-3 py-2.5">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${done ? "border-pine-800 bg-pine-800 text-cream-50" : "border-pine-800/30"}`}>{done ? "✓" : ""}</span>
                  <span className={`flex-1 ${done ? "text-pine-700/50 line-through" : "font-medium"}`}>{a}</span>
                  <span className="text-pine-700/70">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <h2 className="text-4xl text-pine-800">Pronto para organizar a sua ceia?</h2>
        <p className="mt-3 text-pine-700/80">Leva menos de 5 minutos.</p>
        <Link to="/salgados" className="btn-gold mt-8 text-base">Montar minha ceia <ArrowRight className="h-4 w-4" /></Link>
        <p className="mt-10 text-xs text-pine-700/50">Prévia em desenvolvimento: receitas e quantidades em revisão.</p>
      </section>
    </div>
  );
}

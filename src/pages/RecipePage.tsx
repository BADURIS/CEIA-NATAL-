import { Check, ChevronLeft, Clock, FileText, Flame, Plus, Printer, Thermometer } from "../lib/icons";
import { Link, useNavigate, useParams } from "../lib/router";
import { DishVisual, DraftNotice, GuestControl } from "../components/ui";
import { byId } from "../data/catalog";
import { formatQty, scaleRecipe } from "../engine/scale";
import { recipeQtyView } from "../engine/units";
import { batchPlan, pairingsFor, safetyNotes } from "../engine/plan";
import { drinks } from "../data/drinks";
import { useCeia } from "../store/ceia";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

export default function RecipePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const recipe = id ? byId.get(id) : undefined;
  const { guests, hasRecipe, toggleRecipe, hasDrink, toggleDrink } = useCeia();

  if (!recipe) return <p className="py-20 text-center">Receita não encontrada. <Link to="/salgados" className="underline">Voltar</Link></p>;

  const items = scaleRecipe(recipe, guests);
  const added = hasRecipe(recipe.id);
  const groups = [...new Set(items.map((i) => i.group))];
  const d = recipe.details;
  const steps = d?.steps ?? recipe.method.split(/(?<=\.)\s+/).filter(Boolean);
  const batch = batchPlan(recipe, guests);
  const safety = safetyNotes(recipe);
  const pair = pairingsFor(recipe);

  const asText = () =>
    [
      `${recipe.name} — ${guests} convidados`,
      `Ficha-base: ${recipe.yieldText}`,
      "",
      "INGREDIENTES",
      ...items.map((i) => {
        const v = recipeQtyView(i.name, i.scaledQty, i.unit, formatQty);
        return `- ${i.name}: ${v.main}${v.sub ? ` (${v.sub})` : ""}${i.note ? ` — ${i.note}` : ""}`;
      }),
      "",
      "MODO DE PREPARO",
      ...steps.map((s, n) => `${n + 1}. ${s}`),
      "",
      ...(d ? [`Tempo de preparo: ${d.prep}`, `Fogo/forno: ${d.cook}`, "", "DICAS", ...d.tips.map((t) => `- ${t}`), "", "SUBSTITUIÇÕES", ...d.swaps.map((t) => `- ${t}`), "", `Conservação: ${d.storage}`, ""] : []),
      `Observações: ${recipe.scaleNotes}`,
      ...(batch ? ["", `Montagem: ${batch.note}`] : []),
      "",
      "SEGURANÇA DOS ALIMENTOS",
      ...safety.map((n) => `- ${n}`),
    ].join("\n");

  return (
    <article className="animate-rise">
      <button onClick={() => nav(-1)} className="no-print mb-4 inline-flex items-center gap-1 text-sm text-pine-700 hover:underline">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <DishVisual role={recipe.role} name={recipe.name} id={recipe.id} className="aspect-[2/1] rounded-3xl" />
          <p className="eyebrow mt-6">{recipe.category}</p>
          <h1 className="mt-1 text-4xl text-pine-800">{recipe.name}</h1>
          <p className="mt-2 text-pine-700/80">Ficha-base: {recipe.yieldText}</p>
          {d && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-pine-900/10"><Clock className="h-4 w-4 text-gold-500" />Preparo: {d.prep}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-pine-900/10"><Flame className="h-4 w-4 text-gold-500" />Fogo/forno: {d.cook}</span>
            </div>
          )}

          {/* Quantidade de pessoas logo no topo: tudo abaixo é recalculado na hora */}
          <div className="no-print mt-6">
            <GuestControl />
          </div>
          {batch && (
            <div className="mt-4 rounded-2xl bg-gold-300/25 p-4 text-sm text-pine-800">
              <p className="font-semibold">Para {guests} pessoas: {batch.label}</p>
              <p className="mt-1">{batch.note}</p>
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-2xl text-pine-800">Ingredientes <span className="font-sans text-base text-pine-600">para {guests} {guests === 1 ? "pessoa" : "pessoas"}</span></h2>
            {groups.map((g) => (
              <div key={g ?? "main"} className="mt-4">
                {g && <p className="mb-1 text-sm font-semibold text-gold-600">{g}</p>}
                <ul className="divide-y divide-pine-900/5 rounded-2xl bg-white/70">
                  {items.filter((i) => i.group === g).map((i) => {
                    const v = recipeQtyView(i.name, i.scaledQty, i.unit, formatQty);
                    return (
                      <li key={i.name} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                        <span>{i.name}{i.note && <span className="ml-1 text-xs text-pine-700/60">({i.note})</span>}</span>
                        <span className="shrink-0 text-right">
                          <span className="block font-semibold text-pine-800">{v.main}</span>
                          {v.sub && <span className="block max-w-[11rem] text-xs text-pine-700/60">{v.sub}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>

          <section className="mt-10">
            <h2 className="text-2xl text-pine-800">Modo de preparo</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((s, n) => (
                <li key={n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-800 font-display text-cream-50">{n + 1}</span>
                  <p className="pt-1 text-pine-800">{s}</p>
                </li>
              ))}
            </ol>
          </section>

          {d && (
            <section className="mt-10 grid gap-3 sm:grid-cols-3">
              {([["Dicas", d.tips], ["Substituições econômicas", d.swaps], ["Conservação", [d.storage]]] as [string, string[]][]).map(([t, list]) => (
                <div key={t} className="rounded-2xl bg-white/70 p-4 text-sm ring-1 ring-pine-900/5">
                  <p className="mb-1.5 font-semibold text-pine-800">{t}</p>
                  <ul className="space-y-1.5 text-pine-800/90">{list.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))}
            </section>
          )}

          <section className="mt-6 space-y-3">
            <div className="rounded-2xl border border-pine-900/10 p-4 text-sm"><strong className="text-pine-800">Dica de escala: </strong>{recipe.scaleNotes}</div>
            <div className="rounded-2xl bg-pine-50 p-4 text-sm text-pine-800">
              <p className="mb-1.5 flex items-center gap-2 font-semibold"><Thermometer className="h-4 w-4" /> Segurança dos alimentos</p>
              <ul className="list-disc space-y-1 pl-5">{safety.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
            <DraftNotice>Ficha em rascunho: quantidades e tempos ainda não testados em cozinha.</DraftNotice>
          </section>

          <section className="no-print mt-10">
            <h2 className="text-2xl text-pine-800">Combina com</h2>
            <p className="mt-1 text-sm text-pine-700/70">Toque para incluir na sua ceia. Nada entra na lista sem você escolher.</p>
            {([["Com álcool", pair.alcoholic], ["Sem álcool", pair.nonAlcoholic]] as [string, string[]][]).map(([t, ids]) => (
              <div key={t} className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-600">{t}</p>
                <div className="flex flex-wrap gap-2">
                  {ids.map((did) => {
                    const dr = drinks.find((x) => x.id === did)!;
                    const on = hasDrink(did);
                    return (
                      <button key={did} onClick={() => toggleDrink(did)} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${on ? "bg-pine-800 text-cream-50" : "bg-white text-pine-800 ring-1 ring-pine-900/10 hover:bg-cream-50"}`}>
                        {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{dr.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="no-print space-y-4 lg:sticky lg:top-20 lg:self-start">
          <button onClick={() => toggleRecipe(recipe.id)} className={added ? "btn-ghost w-full py-3" : "btn-primary w-full"}>
            {added ? <><Check className="h-4 w-4" /> Na minha ceia, remover</> : <><Plus className="h-4 w-4" /> Adicionar à minha ceia</>}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => window.print()} className="btn-ghost"><Printer className="h-4 w-4" /> Imprimir / PDF</button>
            <button onClick={() => download(`${recipe.id}.txt`, asText())} className="btn-ghost"><FileText className="h-4 w-4" /> Texto</button>
          </div>
        </aside>
      </div>
    </article>
  );
}

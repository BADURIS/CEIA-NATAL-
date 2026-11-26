import { ArrowRight, Check, ChevronDown, Plus } from "../lib/icons";
import { useState } from "react";
import { drinkRecipes } from "../data/drink-recipes";
import { drinkAmount, formatQty, JAR_LITERS, scaleByVolume } from "../engine/scale";
import { Link } from "../lib/router";
import { DRINK_ICON, GuestControl, PageHeader } from "../components/ui";
import { drinkGroups, drinks } from "../data/drinks";
import { useCeia } from "../store/ceia";

function Thumb({ id }: { id: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={`fotos/${id}.webp`} alt="" loading="lazy" onError={() => setOk(false)} className="h-12 w-12 shrink-0 rounded-xl object-cover" />;
}

export default function Drinks() {
  const { hasDrink, toggleDrink, drinkLines, drinkIds } = useCeia();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <PageHeader eyebrow="Passo 3 de 3" title="Bebidas" subtitle="Opções econômicas, com e sem álcool. O consumo é dividido entre as bebidas que você escolher." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          {drinkGroups.map((g) => {
            const Icon = DRINK_ICON[g];
            return (
              <section key={g}>
                <h2 className="mb-3 flex items-center gap-2 text-xl text-pine-800"><Icon className="h-5 w-5 text-gold-500" />{g}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {drinks.filter((d) => d.group === g).map((d) => {
                    const on = hasDrink(d.id);
                    const line = drinkLines.find((l) => l.drink.id === d.id);
                    const rec = drinkRecipes[d.id];
                    const liters = line?.liters ?? rec?.baseLiters ?? 0;
                    return (
                      <div key={d.id} className={open === d.id ? "sm:col-span-2" : ""}>
                      <button
                        key={d.id}
                        onClick={() => {
                          toggleDrink(d.id);
                          // Sucos, drinks e água com limão: ao escolher, já mostra ingredientes e preparo.
                          if (rec) setOpen(on ? null : d.id);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${on ? "bg-pine-800 text-cream-50 shadow-soft" : "bg-white/80 ring-1 ring-pine-900/5 hover:bg-white"}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Thumb id={d.id} />
                          <span className="min-w-0">
                          <span className="block font-medium">{d.name}</span>
                          <span className={`text-xs ${on ? "text-cream-50/70" : "text-pine-700/60"}`}>
                            {on && line ? drinkAmount(line) : rec ? "Toque para ver ingredientes e preparo" : d.note ?? d.pack?.label}
                          </span>
                          </span>
                        </span>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-gold-400 text-pine-900" : "bg-cream-200 text-pine-800"}`}>
                          {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </span>
                      </button>
                      {rec && (
                        <button onClick={() => setOpen(open === d.id ? null : d.id)} className="mt-1 inline-flex items-center gap-1 px-2 text-xs font-medium text-pine-700 hover:underline">
                          {open === d.id ? "Fechar ficha" : "Ver ingredientes e preparo"} <ChevronDown className={`h-3.5 w-3.5 transition ${open === d.id ? "rotate-180" : ""}`} />
                        </button>
                      )}
                      {rec && open === d.id && (
                        <div className="card mt-2 p-4 text-sm">
                          <p className="text-xs text-pine-700/70">Ficha-base: {rec.yieldText} · preparo {rec.prep}</p>
                          <p className="mt-2 font-semibold text-pine-800">Para {liters.toLocaleString("pt-BR")} L ({Math.max(1, Math.ceil(liters / JAR_LITERS - 0.05))} {Math.ceil(liters / JAR_LITERS - 0.05) > 1 ? "jarras" : "jarra"} de 1,5 L){!on && " · ficha-base"}</p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gold-600">Ingredientes</p>
                          <ul className="mt-1 divide-y divide-pine-900/5">
                            {scaleByVolume(rec.ingredients, rec.baseLiters, liters).map((ing) => (
                              <li key={ing.name} className="flex justify-between gap-3 py-1.5">
                                <span>{ing.name}{ing.note && <span className="text-xs text-pine-700/60"> ({ing.note})</span>}</span>
                                <span className="shrink-0 font-medium">{formatQty(ing.scaledQty, ing.unit)}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gold-600">Modo de preparo</p>
                          <ol className="mt-1 list-decimal space-y-1 pl-5 text-pine-800">{rec.steps.map((st) => <li key={st}>{st}</li>)}</ol>
                          <p className="mt-3 text-xs text-pine-700/70">{rec.tips.join(" ")} {rec.storage}</p>
                        </div>
                      )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <GuestControl />
          <p className="text-xs text-pine-700/70">Referência inicial: cerca de 800 ml de bebida sem álcool por pessoa, divididos entre as opções escolhidas; 1 garrafa de espumante ou vinho a cada 4 pessoas. Refrigerantes em garrafas de 2 L; sucos e águas em jarras de 1,5 L. Tudo ajustável na lista.</p>
          {drinkIds.length > 0 && (
            <Link to="/minha-ceia" className="btn-primary w-full">Ver minha ceia <ArrowRight className="h-4 w-4" /></Link>
          )}
        </aside>
      </div>
    </div>
  );
}

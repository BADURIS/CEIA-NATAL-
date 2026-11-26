import { ArrowRight, ChevronDown, Pencil, Trash2 } from "../lib/icons";
import { useState } from "react";
import { Link } from "../lib/router";
import { DishVisual, DraftNotice, GuestControl, PageHeader } from "../components/ui";
import { byId } from "../data/catalog";
import { drinkAmount, formatQty } from "../engine/scale";
import { recipeQtyView } from "../engine/units";
import { batchPlan } from "../engine/plan";
import { useCeia } from "../store/ceia";

export default function MyCeia() {
  const { lines, drinkLines, toggleRecipe, toggleDrink, guests } = useCeia();
  const [open, setOpen] = useState<string | null>(null);
  const empty = lines.length + drinkLines.length === 0;

  return (
    <div>
      <PageHeader eyebrow="Minha ceia" title={`Ceia para ${guests} ${guests === 1 ? "pessoa" : "pessoas"}`} subtitle="Os pratos dividem as porções entre si: duas carnes não viram duas porções cheias por pessoa." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {empty && (
            <div className="card p-10 text-center">
              <p className="font-display text-2xl text-pine-800">Sua ceia está vazia</p>
              <p className="mt-2 text-pine-700/70">Comece escolhendo os pratos salgados.</p>
              <Link to="/salgados" className="btn-primary mt-6">Escolher pratos <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
          {lines.map((l) => {
            const r = byId.get(l.id)!;
            const isOpen = open === l.id;
            return (
              <div key={l.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <DishVisual role={r.role} name={r.name} id={r.id} className="h-14 w-14 shrink-0 rounded-2xl [&_span]:hidden [&_svg]:h-7 [&_svg]:w-7" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-snug text-pine-800">{r.name}</p>
                    <p className="text-xs text-pine-700/70">
                      <span className="hidden sm:inline">{r.category} · </span>~{l.portions} porções{l.share < 1 && ` · ${Math.round(l.share * 100)}% da porção`}{(() => { const b = batchPlan(r, guests, l.share); return b ? ` · ${b.label}` : ""; })()}
                    </p>
                  </div>
                  <Link to={`/receita/${r.id}`} aria-label="Editar" className="rounded-full p-1.5 text-pine-700 hover:bg-cream-200"><Pencil className="h-4 w-4" /></Link>
                  <button onClick={() => toggleRecipe(r.id)} aria-label="Remover" className="rounded-full p-1.5 text-pine-700 hover:bg-cream-200"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => setOpen(isOpen ? null : l.id)} aria-label="Ingredientes" className="rounded-full p-1.5 text-pine-700 hover:bg-cream-200">
                    <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {isOpen && (
                  <ul className="border-t border-pine-900/5 px-5 py-3 text-sm">
                    {l.items.map((i) => (
                      <li key={i.name} className="flex justify-between py-1"><span>{i.name}</span><span className="font-medium">{recipeQtyView(i.name, i.scaledQty, i.unit, formatQty).main}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {drinkLines.length > 0 && (
            <div className="card p-4">
              <p className="mb-2 font-display text-lg text-pine-800">Bebidas</p>
              {drinkLines.map((d) => (
                <div key={d.drink.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span>{d.drink.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{drinkAmount(d)}</span>
                    <button onClick={() => toggleDrink(d.drink.id)} aria-label="Remover" className="text-pine-700/60 hover:text-pine-800"><Trash2 className="h-4 w-4" /></button>
                  </span>
                </div>
              ))}
            </div>
          )}
          {!empty && <DraftNotice />}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <GuestControl />
          {!empty && <Link to="/lista" className="btn-gold w-full">Gerar lista de compras <ArrowRight className="h-4 w-4" /></Link>}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <Link to="/salgados" className="btn-ghost px-2">+ Salgados</Link>
            <Link to="/sobremesas" className="btn-ghost px-2">+ Doces</Link>
            <Link to="/bebidas" className="btn-ghost px-2">+ Bebidas</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

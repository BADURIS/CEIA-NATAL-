import { ArrowRight } from "../lib/icons";
import { useState } from "react";
import { Link } from "../lib/router";
import RecipeCard from "../components/RecipeCard";
import { DraftNotice, PageHeader } from "../components/ui";
import { dessertCategories, recipes, savoryCategories } from "../data/catalog";
import { useCeia } from "../store/ceia";

export default function Catalog({ kind }: { kind: "salgado" | "sobremesa" }) {
  const cats = kind === "salgado" ? savoryCategories : dessertCategories;
  const [active, setActive] = useState<string | null>(null);
  const { recipeIds } = useCeia();
  const list = recipes.filter((r) => r.kind === kind && (!active || r.category === active));
  const picked = recipes.filter((r) => r.kind === kind && recipeIds.includes(r.id)).length;

  return (
    <div key={kind}>
      <PageHeader
        eyebrow={kind === "salgado" ? "Passo 1 de 3" : "Passo 2 de 3"}
        title={kind === "salgado" ? "Pratos salgados" : "Sobremesas"}
        subtitle={kind === "salgado" ? "Carnes, acompanhamentos, saladas e entradas. Toque no + para adicionar à sua ceia." : "Pavês, pudins, clássicos de Natal e sobremesas geladas."}
      />
      <div className="no-print -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {[null, ...cats].map((c) => (
          <button
            key={c ?? "todas"}
            onClick={() => setActive(c)}
            className={`chip shrink-0 px-4 py-2 text-sm transition ${active === c ? "bg-pine-800 text-cream-50" : "bg-white text-pine-700 ring-1 ring-pine-900/10"}`}
          >
            {c ?? "Todas"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>

      <div className="mt-8"><DraftNotice /></div>

      {picked > 0 && (
        <div className="no-print fixed inset-x-4 bottom-20 z-20 md:static md:mt-8 md:flex md:justify-end">
          <Link to={kind === "salgado" ? "/sobremesas" : "/bebidas"} className="btn-primary w-full md:w-auto">
            {picked} {picked === 1 ? "escolhido" : "escolhidos"} · Próximo: {kind === "salgado" ? "sobremesas" : "bebidas"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

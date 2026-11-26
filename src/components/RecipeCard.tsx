import { Check, Plus } from "../lib/icons";
import { Link } from "../lib/router";
import type { Recipe } from "../data/types";
import { useCeia } from "../store/ceia";
import { DishVisual } from "./ui";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { hasRecipe, toggleRecipe } = useCeia();
  const added = hasRecipe(recipe.id);
  return (
    <article className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow">
      <Link to={`/receita/${recipe.id}`}>
        <DishVisual role={recipe.role} name={recipe.name} id={recipe.id} className="aspect-[3/2] transition duration-500 group-hover:scale-[1.03]" />
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <Link to={`/receita/${recipe.id}`} className="min-w-0">
          <h3 className="font-display text-lg leading-snug text-pine-800">{recipe.name}</h3>
          <p className="mt-0.5 text-xs text-pine-700/70">{recipe.yieldText}</p>
        </Link>
        <button
          onClick={() => toggleRecipe(recipe.id)}
          aria-label={added ? "Remover da ceia" : "Adicionar à ceia"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${added ? "bg-gold-500 text-white" : "bg-pine-800 text-cream-50 hover:bg-pine-700"}`}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

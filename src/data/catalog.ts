import raw from "./recipes.json";
import salgados from "./details-salgados.json";
import sobremesas from "./details-sobremesas.json";
import type { Recipe, RecipeDetails } from "./types";

const details = { ...salgados, ...sobremesas } as Record<string, RecipeDetails>;
export const recipes = (raw as Recipe[]).map((r) => ({ ...r, details: details[r.id] }));
export const byId = new Map(recipes.map((r) => [r.id, r]));

export const savoryCategories = [
  "Carnes e pratos principais",
  "Arroz, farofas e acompanhamentos",
  "Saladas e pratos frios",
  "Entradas e complementos",
];
export const dessertCategories = [
  "Pavês e sobremesas de travessa",
  "Sobremesas tradicionais de Natal",
  "Pudins, mousses e sobremesas geladas",
  "Sobremesas especiais",
];

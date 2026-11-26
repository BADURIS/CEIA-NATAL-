/**
 * Motor de cálculo — versão de demonstração (Fase 2).
 * Regras definitivas por receita entram na Fase 4; a API pública fica estável.
 */
import type { Drink, Ingredient, Recipe, Role, Unit } from "../data/types";

export interface ScaledIngredient extends Ingredient {
  scaledQty: number | null;
}

/** Itens que só se compram inteiros (aves, peças). */
const WHOLE_ITEMS = /^(peru|chester|frango|pernil|peixe inteiro|abacaxi|manga|limão|maçã|laranja|banana|maracujá|mamão|pão|baguete|tender|chocotone|panetone)/i;
/** Temperos crescem menos que o restante da receita. */
const SEASONINGS = /^(sal|pimenta|alecrim|tomilho|louro|orégano|noz-moscada|cominho|páprica|canela|cravo|baunilha|cheiro-verde|salsinha|manjericão)/i;

/** Fração da porção cheia que cada prato recebe quando há vários do mesmo papel. */
export function roleShare(role: Role, countInRole: number): number {
  if (countInRole <= 1) return 1;
  // Variedade faz cada pessoa provar um pouco de cada: a soma passa de 1, mas sem dobrar.
  const variety = role === "principal" ? 0.25 : 0.2;
  return Math.min(1, (1 + variety * (countInRole - 1)) / countInRole);
}

export function roundQty(qty: number, unit: Unit | null, name = ""): number {
  if (unit === "g" || unit === "ml") {
    const step = qty < 50 ? 5 : qty < 500 ? 10 : 50;
    return Math.max(step, Math.round(qty / step) * step);
  }
  if (unit === "kg" || unit === "l") return Math.max(0.1, Math.round(qty * 10) / 10);
  // Medidas caseiras: de ¼ em ¼; embalagens: de ½ em ½.
  if (unit === "colher-sopa" || unit === "colher-cha" || unit === "xicara") return Math.max(0.25, Math.round(qty * 4) / 4);
  if (unit && ["lata", "caixa", "pacote", "vidro", "maco", "cacho", "envelope"].includes(unit)) return Math.max(0.5, Math.round(qty * 2) / 2);
  if (unit === "un" && !WHOLE_ITEMS.test(name)) return Math.max(0.5, Math.ceil(qty * 2) / 2);
  // Peças inteiras: até 25% acima de uma unidade, a variedade de pratos cobre a diferença.
  if (unit === "un") return Math.max(1, Math.ceil(qty - 0.25 - 1e-9));
  return Math.max(1, Math.ceil(qty - 1e-9));
}

export function scaleRecipe(recipe: Recipe, guests: number, share = 1): ScaledIngredient[] {
  const factor = (guests * share) / recipe.basePortions;
  return recipe.ingredients.map((ing) => {
    if (ing.qty == null) return { ...ing, scaledQty: null };
    const f = SEASONINGS.test(ing.name) ? Math.pow(factor, 0.85) : factor;
    return { ...ing, scaledQty: roundQty(ing.qty * f, ing.unit, ing.name) };
  });
}

/** Escala uma ficha de bebida pelo volume necessário. */
export function scaleByVolume(ingredients: Ingredient[], baseLiters: number, liters: number): ScaledIngredient[] {
  const factor = liters / baseLiters;
  return ingredients.map((ing) =>
    ing.qty == null ? { ...ing, scaledQty: null } : { ...ing, scaledQty: roundQty(ing.qty * factor, ing.unit, ing.name) },
  );
}

export function portionsFor(guests: number, share = 1): number {
  return Math.max(1, Math.round(guests * share));
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** 1.5 → "1 ½"; 0.25 → "¼"; 0.33 → "⅓". */
export function fraction(n: number): string {
  const whole = Math.floor(n + 1e-9);
  const rest = n - whole;
  const frac = [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]].find(([v]) => Math.abs(rest - (v as number)) < 0.04)?.[1];
  if (rest < 0.04) return String(whole);
  if (!frac) return fmt(n);
  return whole ? `${whole} ${frac}` : String(frac);
}

const LABEL: Partial<Record<Unit, [string, string]>> = {
  dente: ["dente", "dentes"], ramo: ["ramo", "ramos"], folha: ["folha", "folhas"], lata: ["lata", "latas"],
  caixa: ["caixa", "caixas"], "pé": ["pé", "pés"], "colher-sopa": ["colher (sopa)", "colheres (sopa)"],
  "colher-cha": ["colher (chá)", "colheres (chá)"], xicara: ["xícara", "xícaras"], pacote: ["pacote", "pacotes"],
  maco: ["maço", "maços"], talo: ["talo", "talos"], vidro: ["vidro", "vidros"], envelope: ["envelope", "envelopes"],
  pitada: ["pitada", "pitadas"], cacho: ["cacho", "cachos"], pedaco: ["pedaço", "pedaços"],
};

export function formatQty(qty: number | null, unit: Unit | null): string {
  if (qty == null) return "a gosto";
  if (unit === "g" && qty >= 1000) return `${fmt(qty / 1000)} kg`;
  if (unit === "ml" && qty >= 1000) return `${fmt(qty / 1000)} L`;
  if (unit === "l") return `${fmt(qty)} L`;
  if (unit === "un" || unit == null) return fraction(qty);
  const label = LABEL[unit];
  if (label) return `${fraction(qty)} ${qty > 1 ? label[1] : label[0]}`;
  return `${fmt(qty)} ${unit}`;
}

/* ---------------- Bebidas ---------------- */

export interface DrinkLine {
  drink: Drink;
  liters: number;
  packs: number | null;
}

/** Bebidas preparadas são servidas em jarras de 1,5 L. */
export const JAR_LITERS = 1.5;
export function drinkAmount(line: DrinkLine): string {
  if (line.packs && line.drink.id === "agua-com-gas")
    return `${line.packs} ${line.packs > 1 ? "jarras" : "jarra"} (${line.packs} ${line.packs > 1 ? "garrafas" : "garrafa"} de 1,5 L)`;
  if (line.packs && line.drink.pack) return `${line.packs} × ${line.drink.pack.label}`;
  const jars = Math.max(1, Math.ceil(line.liters / JAR_LITERS - 0.05));
  return `${line.liters.toLocaleString("pt-BR")} L · ${jars} ${jars > 1 ? "jarras" : "jarra"}`;
}

/** Referências de planejamento (planilha "Regras de cálculo"): 600 ml a 1 L sem álcool por adulto. */
export const DRINK_PARAMS = { nonAlcoholicMlPerGuest: 800, bottleGuestsWine: 4, bottleGuestsSparkling: 4, drinkMlPerGuest: 200 };

export function planDrinks(guests: number, selected: Drink[]): DrinkLine[] {
  const nonAlc = selected.filter((d) => !d.alcoholic);
  const wines = selected.filter((d) => d.group === "Vinhos");
  const mixed = selected.filter((d) => d.group === "Drinks");
  return selected.map((drink) => {
    let ml = 0;
    if (!drink.alcoholic) ml = (guests * DRINK_PARAMS.nonAlcoholicMlPerGuest) / nonAlc.length;
    else if (drink.group === "Espumante") ml = (guests / DRINK_PARAMS.bottleGuestsSparkling) * 750;
    else if (drink.group === "Vinhos") ml = ((guests / DRINK_PARAMS.bottleGuestsWine) * 750) / wines.length;
    else ml = (guests * DRINK_PARAMS.drinkMlPerGuest) / mixed.length;
    const packs = drink.pack ? Math.max(1, Math.ceil(ml / drink.pack.ml)) : null;
    return { drink, liters: Math.round(ml / 100) / 10, packs };
  });
}

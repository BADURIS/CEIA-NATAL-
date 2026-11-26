import type { Unit } from "../data/types";
import { formatQty, type DrinkLine, type ScaledIngredient } from "./scale";
import { alias, findProduce, packCount, produceCount, PURCHASE, TO_BASE } from "./units";

/** Unidades compradas inteiras: a lista arredonda para cima. */
const COUNT_UNITS = new Set<Unit>(["un", "lata", "caixa", "pacote", "vidro", "maco", "cacho", "envelope", "pé", "talo", "dente", "ramo", "folha", "pedaco"]);

export const MARKET_SECTIONS = [
  "Carnes e aves", "Peixes e frutos do mar", "Frutas", "Verduras e legumes", "Laticínios e frios",
  "Mercearia", "Temperos", "Bebidas", "Produtos de padaria", "Outros",
] as const;
export type MarketSection = (typeof MARKET_SECTIONS)[number];

const RULES: [RegExp, MarketSection][] = [
  [/bacalhau|peixe|atum|sardinha/i, "Peixes e frutos do mar"],
  [/peru|chester|pernil|lombo|tender|frango|carne|costela|bacon|calabresa/i, "Carnes e aves"],
  [/sal\b|sal grosso|pimenta|alecrim|tomilho|louro|orégano|noz-moscada|cominho|páprica|canela|cravo|baunilha|cheiro-verde|salsinha|manjericão|hortelã|alho\b|mostarda/i, "Temperos"],
  [/leite|creme de leite|manteiga|queijo|muçarela|parmesão|requeijão|cream cheese|iogurte|ovo|gema/i, "Laticínios e frios"],
  [/pão|panetone|chocotone|biscoito|bis\b/i, "Produtos de padaria"],
  [/laranja|limão|abacaxi|maçã|manga|banana|uva|morango|mamão|maracujá|ameixa|damasco|frutas/i, "Frutas"],
  [/cebola|tomate|cenoura|pimentão|batata|brócolis|abobrinha|berinjela|alface|pepino|alho-poró|mandioquinha|salsão|ervilha|milho|champignon/i, "Verduras e legumes"],
  [/vinho|cerveja|cachaça|vodca|gelo|água filtrada|suco concentrado/i, "Bebidas"],
];
const FIRST: [RegExp, MarketSection][] = [
  [/^(cachaça|vodca|gelo|água filtrada|suco concentrado)/i, "Bebidas"],
  [/^(amido|farinha de milho|milho$|ervilha$|uvas-passas|ameixa seca|damasco|castanha|nozes|amendoim|coco ralado|molho de tomate|sardinha|atum)/i, "Mercearia"],
  [/^suco de laranja/i, "Bebidas"],
];

export function sectionFor(name: string): MarketSection {
  for (const [re, s] of [...FIRST, ...RULES]) if (re.test(name)) return s;
  return "Mercearia";
}

export interface ShoppingItem {
  key: string;
  name: string;
  qty: number | null;
  unit: Unit | null;
  display: string;
  packHint: string | null;
  section: MarketSection;
  sources: string[];
  note?: string;
  manual?: boolean;
}

const BASE: Partial<Record<Unit, [Unit, number]>> = { kg: ["g", 1000], l: ["ml", 1000] };

export function consolidate(
  lines: { recipe: string; items: ScaledIngredient[] }[],
  drinkLines: DrinkLine[] = [],
): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const { recipe, items } of lines) {
    for (const ing of items) {
      // Água da torneira não entra na lista.
      if (/^água\b|^caldo do assado/i.test(ing.name.trim())) continue;
      let { scaledQty: qty, unit } = ing;
      let name = alias(ing.name);
      const conv = TO_BASE.find((c) => c.re.test(name) && c.unit === unit);
      if (conv && qty != null) {
        qty *= conv.f;
        unit = conv.to;
      }
      let note: string | undefined;
      if (unit && BASE[unit] && qty != null) {
        const [u, m] = BASE[unit]!;
        qty *= m;
        unit = u;
      }
      // Peso de compra: cozido → cru, dessalgado → salgado, cozido → seco.
      const buy = PURCHASE.find((p) => p.re.test(name));
      if (buy && unit === "g" && qty != null) {
        qty = Math.round((qty * buy.factor) / 10) * 10;
        note = `receita pede ${name.toLowerCase()}; ${buy.why}`;
        name = buy.to;
      }
      // Hortifrúti em gramas vira contagem para somar com itens em unidade.
      const prod = findProduce(name);
      if (prod && unit === "g" && qty != null) {
        qty = qty / prod.grams;
        unit = "un";
      }
      const key = `${name.toLowerCase()}|${unit ?? "agosto"}`;
      const cur = map.get(key);
      if (cur) {
        if (cur.qty != null && qty != null) cur.qty += qty;
        if (!cur.sources.includes(recipe)) cur.sources.push(recipe);
      } else {
        map.set(key, { key, name, qty, unit, display: "", packHint: null, section: sectionFor(name), sources: [recipe], note });
      }
    }
  }
  for (const l of drinkLines) {
    const key = `bebida|${l.drink.id}`;
    map.set(key, {
      key, name: l.drink.name, qty: l.packs ?? l.liters, unit: l.packs ? "un" : "l", display: "", packHint: null,
      section: "Bebidas", sources: ["Bebidas"],
    });
  }
  const out = [...map.values()];
  for (const it of out) {
    if (it.key.startsWith("bebida|")) {
      it.display = describeDrink(it, drinkLines);
      continue;
    }
    const prod = findProduce(it.name);
    if (prod && it.unit === "un" && it.qty != null) {
      const n = produceCount(it.qty * prod.grams, prod);
      it.display = `${n} ${n > 1 ? prod.many : prod.one}`;
      it.packHint = `≈ ${formatQty(Math.round((n * prod.grams) / 50) * 50, "g")}`;
      it.qty = n;
      continue;
    }
    if (it.qty != null && it.unit && COUNT_UNITS.has(it.unit)) it.qty = Math.max(1, Math.ceil(it.qty - 0.05));
    if (it.qty != null && (it.unit === "g" || it.unit === "ml")) it.qty = Math.max(5, Math.round(it.qty / 5) * 5);
    it.display = formatQty(it.qty, it.unit);
    if (it.qty != null) {
      const pack = packCount(it.name, it.qty, it.unit);
      if (pack) {
        it.packHint = it.display;
        it.display = pack;
      }
    }
  }
  // Item "a gosto" some quando o mesmo ingrediente já aparece com quantidade.
  const withQty = new Set(out.filter((i) => i.qty != null).map((i) => i.name.toLowerCase()));
  return out.filter((i) => i.qty != null || i.manual || !withQty.has(i.name.toLowerCase())).sort((a, b) => MARKET_SECTIONS.indexOf(a.section) - MARKET_SECTIONS.indexOf(b.section) || a.name.localeCompare(b.name, "pt-BR"));
}

function describeDrink(it: ShoppingItem, lines: DrinkLine[]): string {
  const l = lines.find((x) => `bebida|${x.drink.id}` === it.key)!;
  if (l.packs && l.drink.pack) return `${l.packs} × ${l.drink.pack.label}`;
  return `${l.liters.toLocaleString("pt-BR")} L preparados`;
}

export function toText(items: ShoppingItem[], guests: number): string {
  const lines = [`ceia.fácil — Lista de compras (${guests} convidados)`, ""];
  for (const s of MARKET_SECTIONS) {
    const group = items.filter((i) => i.section === s);
    if (!group.length) continue;
    lines.push(s.toUpperCase());
    for (const i of group) lines.push(`[ ] ${i.name} — ${i.display}${i.packHint ? ` (${i.packHint})` : ""}`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Unidades práticas: converte gramas/ml em "3 tomates médios" ou "2 latas".
 * Pesos médios aproximados (com casca, como se compra); revisar na Fase 4.
 */
import type { Unit } from "../data/types";

interface Produce { re: RegExp; grams: number; one: string; many: string }
interface Pack { re: RegExp; size: number; unit: "g" | "ml"; one: string; many: string }

/** Hortifrúti vendido por unidade: a lista mostra contagem, o peso vai entre parênteses. */
export const PRODUCE: Produce[] = [
  { re: /^tomate$/i, grams: 150, one: "tomate médio", many: "tomates médios" },
  { re: /^cebola roxa$/i, grams: 150, one: "cebola roxa média", many: "cebolas roxas médias" },
  { re: /^cebola$/i, grams: 150, one: "cebola média", many: "cebolas médias" },
  { re: /^cenoura$/i, grams: 120, one: "cenoura média", many: "cenouras médias" },
  { re: /^pimentão$/i, grams: 150, one: "pimentão médio", many: "pimentões médios" },
  { re: /^batata$/i, grams: 150, one: "batata média", many: "batatas médias" },
  { re: /^abobrinha$/i, grams: 250, one: "abobrinha média", many: "abobrinhas médias" },
  { re: /^berinjela$/i, grams: 300, one: "berinjela média", many: "berinjelas médias" },
  { re: /^pepino$/i, grams: 200, one: "pepino médio", many: "pepinos médios" },
  { re: /^mandioquinha$/i, grams: 100, one: "mandioquinha média", many: "mandioquinhas médias" },
  { re: /^alho-poró$/i, grams: 200, one: "talo de alho-poró", many: "talos de alho-poró" },
  { re: /^salsão$/i, grams: 40, one: "talo de salsão", many: "talos de salsão" },
  { re: /^brócolis$/i, grams: 350, one: "maço de brócolis", many: "maços de brócolis" },
  { re: /^abacaxi$/i, grams: 1000, one: "abacaxi médio", many: "abacaxis médios" },
  { re: /^mamão$/i, grams: 400, one: "mamão papaia", many: "mamões papaia" },
];

/** Itens de embalagem: a lista mostra quantas embalagens levar. */
export const PACKS: Pack[] = [
  { re: /^leite condensado$/i, size: 395, unit: "g", one: "lata", many: "latas" },
  { re: /^creme de leite$/i, size: 200, unit: "g", one: "caixinha", many: "caixinhas" },
  { re: /^leite$/i, size: 1000, unit: "ml", one: "caixa de 1 L", many: "caixas de 1 L" },
  { re: /^leite de coco$/i, size: 200, unit: "ml", one: "vidro 200 ml", many: "vidros 200 ml" },
  { re: /^(farinha de mandioca|farinha)$/i, size: 500, unit: "g", one: "pacote 500 g", many: "pacotes 500 g" },
  { re: /^farinha de milho flocada$/i, size: 500, unit: "g", one: "pacote 500 g", many: "pacotes 500 g" },
  { re: /^arroz$/i, size: 1000, unit: "g", one: "pacote 1 kg", many: "pacotes 1 kg" },
  { re: /^açúcar$/i, size: 1000, unit: "g", one: "pacote 1 kg", many: "pacotes 1 kg" },
  { re: /^(amido|amido de milho)$/i, size: 200, unit: "g", one: "caixa 200 g", many: "caixas 200 g" },
  { re: /^(biscoito maisena|biscoito|biscoito triturado)$/i, size: 200, unit: "g", one: "pacote 200 g", many: "pacotes 200 g" },
  { re: /^maionese$/i, size: 500, unit: "g", one: "pote 500 g", many: "potes 500 g" },
  { re: /^manteiga$/i, size: 200, unit: "g", one: "tablete 200 g", many: "tabletes 200 g" },
  { re: /^chocolate em pó$/i, size: 200, unit: "g", one: "pacote 200 g", many: "pacotes 200 g" },
  { re: /^(chocolate meio amargo|chocolate)$/i, size: 100, unit: "g", one: "barra 100 g", many: "barras 100 g" },
  { re: /^gelatina incolor$/i, size: 12, unit: "g", one: "envelope 12 g", many: "envelopes 12 g" },
  { re: /^(cheiro-verde|salsinha)$/i, size: 50, unit: "g", one: "maço", many: "maços" },
  { re: /^manjericão$/i, size: 30, unit: "g", one: "maço", many: "maços" },
  { re: /^(milho|ervilha)$/i, size: 170, unit: "g", one: "lata", many: "latas" },
  { re: /^azeitona$/i, size: 100, unit: "g", one: "vidro", many: "vidros" },
  { re: /^champignon$/i, size: 100, unit: "g", one: "vidro", many: "vidros" },
  { re: /^atum$/i, size: 120, unit: "g", one: "lata", many: "latas" },
  { re: /^pão de forma$/i, size: 500, unit: "g", one: "pacote 500 g", many: "pacotes 500 g" },
  { re: /^batata palha$/i, size: 100, unit: "g", one: "pacote 100 g", many: "pacotes 100 g" },
  { re: /^tomate-cereja$/i, size: 180, unit: "g", one: "bandeja 180 g", many: "bandejas 180 g" },
  { re: /^morango$/i, size: 250, unit: "g", one: "bandeja 250 g", many: "bandejas 250 g" },
  { re: /^(uva|uva sem semente)$/i, size: 500, unit: "g", one: "bandeja 500 g", many: "bandejas 500 g" },
  { re: /^frutas vermelhas$/i, size: 300, unit: "g", one: "pacote congelado 300 g", many: "pacotes congelados 300 g" },
  { re: /^cream cheese$/i, size: 150, unit: "g", one: "pote 150 g", many: "potes 150 g" },
  { re: /^requeijão$/i, size: 200, unit: "g", one: "copo 200 g", many: "copos 200 g" },
  { re: /^iogurte natural$/i, size: 170, unit: "g", one: "pote 170 g", many: "potes 170 g" },
  { re: /^parmesão$/i, size: 50, unit: "g", one: "pacote ralado 50 g", many: "pacotes ralados 50 g" },
  { re: /^coco( ralado)?$/i, size: 100, unit: "g", one: "pacote 100 g", many: "pacotes 100 g" },
  { re: /^molho de tomate$/i, size: 300, unit: "g", one: "sachê 300 g", many: "sachês 300 g" },
  { re: /^azeite$/i, size: 500, unit: "ml", one: "garrafa 500 ml", many: "garrafas 500 ml" },
  { re: /^vinagre$/i, size: 750, unit: "ml", one: "garrafa 750 ml", many: "garrafas 750 ml" },
  { re: /^gelo$/i, size: 5000, unit: "g", one: "saco de 5 kg", many: "sacos de 5 kg" },
  { re: /^(cachaça|vodca)$/i, size: 1000, unit: "ml", one: "garrafa de 1 L", many: "garrafas de 1 L" },
];

/** Ingredientes que a receita pede prontos, mas se compram crus/secos/salgados. */
export const PURCHASE: { re: RegExp; to: string; factor: number; why: string }[] = [
  { re: /^(peito de )?frango cozido( e desfiado)?$|^frango$/i, to: "Peito de frango (cru, sem osso)", factor: 1.3, why: "perde cerca de 25% ao cozinhar" },
  { re: /^grão-de-bico cozido$/i, to: "Grão-de-bico (seco)", factor: 0.5, why: "dobra de peso ao cozinhar" },
  { re: /^bacalhau dessalgado/i, to: "Bacalhau salgado (lombo ou postas)", factor: 0.8, why: "ganha cerca de 25% de peso ao dessalgar" },
];

/** Nomes equivalentes que devem virar uma linha só na lista. */
export const ALIASES: [RegExp, string][] = [
  [/^morangos?( frescos)?$/i, "Morango"], [/^uvas?( verdes)?( sem sementes?)?$/i, "Uva sem semente"],
  [/^azeitonas?$/i, "Azeitona"], [/^chocolate em pó( 50%)?$/i, "Chocolate em pó"], [/^muçarela( ralada)?$/i, "Muçarela"],
  [/^parmesão( ralado)?$/i, "Parmesão"], [/^requeijão( cremoso)?$/i, "Requeijão"], [/^(essência de )?baunilha$/i, "Essência de baunilha"],
  [/^canela( em pó)?$/i, "Canela em pó"], [/^bacon( em cub(os|inhos))?$/i, "Bacon"], [/^castanhas? picadas?$/i, "Castanhas"],
  [/^gemas?$/i, "Ovos"], [/^atum( escorrido| drenado)?$/i, "Atum"], [/^arroz( cru)?$/i, "Arroz"],
  [/^panetone( picado| em fatias ou cubos)?$/i, "Panetone"], [/^ameixas? secas?( sem caroço| picadas?)?$/i, "Ameixa seca"],
  [/^damasco( picado)?$/i, "Damasco"], [/^nozes( picadas)?$/i, "Nozes"], [/^castanha-de-caju( picada)?$/i, "Castanha-de-caju"],
  [/^champignon( fatiado)?$/i, "Champignon"], [/^suco de limão( espremido)?$/i, "Limão"],
  [/^sal e pimenta(-do-reino)?$/i, "Sal e pimenta-do-reino"], [/^vinho branco seco( ou água)?$/i, "Vinho branco seco"],
];

/** Medidas caseiras convertidas para peso/volume só na lista, para somar com o que vem em g/ml. */
export const TO_BASE: { re: RegExp; unit: Unit; to: "g" | "ml" | "un"; f: number }[] = [
  { re: /^limão$/i, unit: "colher-sopa", to: "un", f: 0.5 },   // 1 limão ≈ 2 colheres de suco
  { re: /^limão$/i, unit: "ml", to: "un", f: 1 / 30 },         // 1 limão ≈ 30 ml de suco
  { re: /^leite condensado$/i, unit: "lata", to: "g", f: 395 },
  { re: /^creme de leite$/i, unit: "caixa", to: "g", f: 200 },
  { re: /^creme de leite$/i, unit: "ml", to: "g", f: 1 },
  { re: /^(milho|ervilha)$/i, unit: "lata", to: "g", f: 170 },
  { re: /^(milho|ervilha)$/i, unit: "xicara", to: "g", f: 150 },
  { re: /^morango$/i, unit: "caixa", to: "g", f: 250 },
  { re: /^leite de coco$/i, unit: "vidro", to: "ml", f: 200 },
  { re: /^(leite|água|óleo|vinagre|azeite)$/i, unit: "xicara", to: "ml", f: 240 },
  { re: /^(leite|água|óleo|vinagre|azeite)$/i, unit: "colher-sopa", to: "ml", f: 15 },
  { re: /^arroz$/i, unit: "xicara", to: "g", f: 190 },
  { re: /^açúcar$/i, unit: "xicara", to: "g", f: 180 },
  { re: /^açúcar$/i, unit: "colher-sopa", to: "g", f: 12 },
  { re: /^farinha de trigo$/i, unit: "xicara", to: "g", f: 120 },
  { re: /^farinha de trigo$/i, unit: "colher-sopa", to: "g", f: 8 },
  { re: /^farinha de milho flocada$/i, unit: "xicara", to: "g", f: 100 },
  { re: /^chocolate em pó$/i, unit: "xicara", to: "g", f: 90 },
  { re: /^chocolate em pó$/i, unit: "colher-sopa", to: "g", f: 6 },
  { re: /^amido de milho$/i, unit: "colher-sopa", to: "g", f: 8 },
  { re: /^manteiga$/i, unit: "colher-sopa", to: "g", f: 15 },
  { re: /^manteiga$/i, unit: "colher-cha", to: "g", f: 5 },
  { re: /^(uvas-passas|damasco|castanhas|castanha-de-caju|azeitona|ameixa seca)$/i, unit: "xicara", to: "g", f: 130 },
  { re: /^nozes$/i, unit: "xicara", to: "g", f: 100 },
  { re: /^molho de tomate$/i, unit: "xicara", to: "g", f: 240 },
  { re: /^(cheiro-verde|salsinha)$/i, unit: "colher-sopa", to: "g", f: 4 },
];

export const alias = (name: string) => ALIASES.find(([re]) => re.test(name.trim()))?.[1] ?? name.trim();

const toBase = (qty: number, unit: Unit | null): [number, Unit | null] =>
  unit === "kg" ? [qty * 1000, "g"] : unit === "l" ? [qty * 1000, "ml"] : [qty, unit];

const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export const findProduce = (name: string) => PRODUCE.find((p) => p.re.test(name.trim()));
export const findPack = (name: string, unit: Unit | null) => {
  const u = toBase(1, unit)[1];
  return PACKS.find((p) => p.re.test(name.trim()) && p.unit === u);
};

/** Para a ficha: "1,5 tomate médio" a partir de gramas (meias unidades). */
export function produceForRecipe(name: string, qty: number | null, unit: Unit | null): string | null {
  if (qty == null) return null;
  const [q, u] = toBase(qty, unit);
  const p = findProduce(name);
  if (!p || u !== "g") return null;
  const n = Math.max(0.5, Math.round((q / p.grams) * 2) / 2);
  return `${num(n)} ${n > 1 ? p.many : p.one}`;
}

/** Para a lista: compra em unidades inteiras (tolerância de 15%). */
export function produceCount(grams: number, p: Produce): number {
  return Math.max(1, Math.ceil(grams / p.grams - 0.15));
}

export function packCount(name: string, qty: number, unit: Unit | null): string | null {
  const p = findPack(name, unit);
  if (!p) return null;
  const [q] = toBase(qty, unit);
  const n = Math.max(1, Math.ceil(q / p.size - 0.05));
  return `${n} ${n > 1 ? p.many : p.one}`;
}

/** Como a ficha mostra a quantidade: unidade prática em destaque, peso ou compra como apoio. */
export function recipeQtyView(name: string, qty: number | null, unit: Unit | null, format: (q: number | null, u: Unit | null) => string) {
  const exact = format(qty, unit);
  if (qty == null) return { main: exact, sub: null as string | null };
  const prod = produceForRecipe(name, qty, unit);
  if (prod) return { main: prod, sub: `≈ ${exact}` };
  const buy = PURCHASE.find((p) => p.re.test(name.trim()));
  const [q, u] = toBase(qty, unit);
  if (buy && u === "g") return { main: exact, sub: `compre ≈ ${format(Math.round((q * buy.factor) / 10) * 10, "g")} de ${buy.to.toLowerCase()}` };
  const pack = packCount(name, qty, unit);
  return { main: exact, sub: pack ? `≈ ${pack}` : null };
}

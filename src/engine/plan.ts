/**
 * Fase 4 — regras de montagem além dos ingredientes:
 * formas/travessas, levas, harmonização e segurança dos alimentos.
 */
import type { Recipe } from "../data/types";

export interface BatchPlan {
  count: number;
  label: string;
  note: string;
}

const CONTAINER = /^(travessa[^(]*|forma[^(]*|assadeira[^(]*)/i;
const PIECE = /^(1 peru[^(]*|1 chester[^(]*|frango inteiro[^(]*|peixe inteiro[^(]*|1 chocotone[^(]*|1 pão grande|pão italiano 1 baguete)/i;

const PIECE_NAME = /^(peru|chester|pernil|frango inteiro|peixe inteiro|tender|chocotone)/i;
const PLURAL: [RegExp, string][] = [[/^travessa/i, "travessas"], [/^forma/i, "formas"], [/^assadeira/i, "assadeiras"]];

/** Quantas formas, peças ou levas a receita precisa para o número de convidados. */
export function batchPlan(recipe: Recipe, guests: number, share = 1): BatchPlan | null {
  const factor = (guests * share) / recipe.basePortions;
  const usesOven = !!recipe.details && !/não vai ao fogo/i.test(recipe.details.cook) && /\bforno\b|\basse\b/i.test(recipe.details.steps.join(" "));

  const container = (recipe.vessel ?? recipe.yieldText).match(CONTAINER)?.[1].trim();
  if (container) {
    const count = Math.max(1, Math.ceil(factor - 0.15));
    if (count === 1) return null;
    const plural = PLURAL.find(([re]) => re.test(container))?.[1] ?? "recipientes";
    const size = container.replace(/^\S+\s*/, "");
    const label = `${count} ${plural}${size ? ` (${size})` : ""}`;
    const note = usesOven
      ? `Monte em ${label}. O tempo de forno da ficha é por forma: assando ${count} juntas, acrescente de 10 a 15 min e troque as prateleiras na metade.`
      : `Monte em ${label}, cada uma com a receita-base.`;
    return { count, label, note };
  }

  const main = recipe.ingredients.find((i) => i.unit === "un" && i.qty === 1 && PIECE_NAME.test(i.name));
  const piece = main ? `${main.name.toLowerCase()}${main.note ? ` ${main.note.replace(/^aprox\. /, "de ")}` : ""}` : recipe.yieldText.match(PIECE)?.[1].trim();
  if (piece) {
    const count = Math.max(1, Math.ceil(factor - 0.25));
    if (count === 1) return null;
    return {
      count,
      label: `${count} peças`,
      note: `São ${count} peças (${piece.replace(/^1 /, "")}). Confira se cabem juntas no forno; se não couberem, asse em etapas e mantenha a primeira aquecida e coberta.`,
    };
  }

  if (factor > 2.5) {
    const count = Math.ceil(factor / 2.5);
    return { count, label: `${count} levas`, note: `Para essa quantidade, prepare em ${count} levas ou use uma panela bem maior: panela cheia demais cozinha de forma desigual.` };
  }
  return null;
}

/* ---------------- Harmonização ---------------- */

export interface Pairing { alcoholic: string[]; nonAlcoholic: string[] }

const RED = /carne-assada|costela-bovina/;
const FISH = /bacalhau|peixe|atum/;
const LIGHT = /peru|chester|frango|pernil|lombo|tender|costela-suina/;

export function pairingsFor(recipe: Recipe): Pairing {
  if (RED.test(recipe.id)) return { alcoholic: ["vinho-tinto-seco", "vinho-tinto-suave"], nonAlcoholic: ["suco-laranja", "guarana", "coca-cola", "agua-com-gas"] };
  if (FISH.test(recipe.id)) return { alcoholic: ["vinho-branco-seco", "espumante", "vinho-rose"], nonAlcoholic: ["limonada", "agua-com-limao", "agua-com-gas", "sprite"] };
  if (LIGHT.test(recipe.id)) return { alcoholic: ["espumante", "vinho-branco-seco", "vinho-rose"], nonAlcoholic: ["suco-abacaxi-hortela", "suco-laranja", "guarana", "coca-cola", "agua-com-gas", "agua-com-limao"] };
  if (recipe.kind === "sobremesa") return { alcoholic: ["espumante", "vinho-branco-suave", "vinho-tinto-suave"], nonAlcoholic: ["suco-melancia", "agua-com-gas", "coca-cola", "guarana"] };
  return { alcoholic: ["vinho-branco-seco", "vinho-rose", "espumante"], nonAlcoholic: ["limonada", "suco-maracuja", "guarana", "agua-com-gas"] };
}

/* ---------------- Segurança dos alimentos ---------------- */

export function safetyNotes(recipe: Recipe): string[] {
  const notes: string[] = [];
  const names = recipe.ingredients.map((i) => i.name.toLowerCase()).join(" ");
  const id = recipe.id;
  if (/peru|chester|frango/.test(id)) notes.push("Aves e recheio precisam atingir 74 °C na parte mais grossa. Use termômetro culinário.");
  if (/pernil|lombo|costela-suina/.test(id)) notes.push("Carne suína: no mínimo 63 °C no centro, com 3 min de descanso; para fatiar macio, 71 °C.");
  if (/peixe|bacalhau/.test(id)) notes.push("Peixe pronto: carne opaca, que solta em lascas (63 °C).");
  if (/bacalhau/.test(id)) notes.push("Dessalgue sempre dentro da geladeira, trocando a água de 3 a 4 vezes ao dia.");
  if (/maionese|creme de leite|leite condensado|cream cheese|iogurte|requeijão|ovos/.test(names) && (recipe.kind === "sobremesa" || /salpic|maionese|torta-fria|pate/.test(id)))
    notes.push("Mantenha na geladeira até servir e não deixe mais de 2 horas fora. Em dia muito quente, 1 hora.");
  if (recipe.details && /não vai ao fogo/i.test(recipe.details.cook) || /morango|salada|uva|frutas/.test(id))
    notes.push("Higienize frutas e verduras que vão cruas: lave em água corrente e deixe de molho na solução sanitizante (siga o rótulo), depois enxágue.");
  notes.push("Transporte pratos frios em caixa térmica com gelo e os quentes bem tampados.");
  return notes;
}

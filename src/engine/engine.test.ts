import { test } from "node:test";
import assert from "node:assert/strict";
import { formatQty, planDrinks, roleShare, roundQty, scaleRecipe } from "./scale";
import { consolidate } from "./shopping";
import type { Drink, Recipe } from "../data/types";

const pave: Recipe = {
  id: "pave", number: 1, name: "Pavê", kind: "sobremesa", category: "x", role: "sobremesa", yieldText: "",
  basePortions: 8, method: "", scaleNotes: "", status: "rascunho",
  ingredients: [
    { name: "Leite condensado", qty: 395, unit: "g", note: null, group: null },
    { name: "Ovos", qty: 3, unit: "un", note: null, group: null },
    { name: "Sal", qty: 4, unit: "g", note: null, group: null },
    { name: "Óleo para fritar", qty: null, unit: null, note: "a gosto", group: null },
  ],
};

test("mesmo número de convidados mantém a ficha-base", () => {
  const s = scaleRecipe(pave, 8);
  assert.equal(s[0].scaledQty, 400); // arredondado ao passo de 10 g
  assert.equal(s[1].scaledQty, 3);
});

test("dobrar convidados dobra ingredientes principais", () => {
  const s = scaleRecipe(pave, 16);
  assert.equal(s[0].scaledQty, 800);
  assert.equal(s[1].scaledQty, 6);
});

test("temperos crescem menos que linear", () => {
  const s = scaleRecipe(pave, 40);
  assert.ok((s[2].scaledQty as number) < 4 * 5);
});

test("ingrediente a gosto não é escalado", () => {
  assert.equal(scaleRecipe(pave, 20)[3].scaledQty, null);
});

test("unidades arredondam para cima, aves sempre inteiras", () => {
  assert.equal(roundQty(1.2, "un", "Chester"), 1);
  assert.equal(roundQty(1.4, "un", "Chester"), 2);
  assert.equal(roundQty(1.2, "un", "Cebola"), 1.5);
  assert.equal(roundQty(2.1, "dente"), 3);
});

test("vários pratos do mesmo papel reduzem a porção de cada um", () => {
  assert.equal(roleShare("principal", 1), 1);
  const two = roleShare("principal", 2);
  assert.ok(two < 1 && two > 0.5);
  assert.ok(roleShare("sobremesa", 3) * 3 < 2);
});

test("formatação converte para kg e L", () => {
  assert.equal(formatQty(1500, "g"), "1,5 kg");
  assert.equal(formatQty(2, "dente"), "2 dentes");
});

test("lista soma itens iguais e separa unidades incompatíveis", () => {
  const list = consolidate([
    { recipe: "A", items: [{ name: "Leite condensado", qty: 1, unit: "g", note: null, group: null, scaledQty: 395 }] },
    { recipe: "B", items: [
      { name: "Leite condensado", qty: 1, unit: "g", note: null, group: null, scaledQty: 200 },
      { name: "Cebola", qty: 1, unit: "un", note: null, group: null, scaledQty: 2 },
      { name: "Cebola", qty: 1, unit: "g", note: null, group: null, scaledQty: 150 },
    ] },
  ]);
  const lc = list.find((i) => i.name === "Leite condensado")!;
  assert.equal(lc.qty, 595);
  assert.equal(lc.display, "2 latas");
  const cebola = list.filter((i) => i.name === "Cebola");
  assert.equal(cebola.length, 1); // 2 un + 150 g viram uma linha só
  assert.equal(cebola[0].display, "3 cebolas médias");
});

test("bebidas sem álcool dividem o consumo entre as escolhidas", () => {
  const coca: Drink = { id: "c", name: "Coca", group: "Refrigerantes", kind: "comprada", alcoholic: false, pack: { label: "lata", ml: 350 } };
  const agua: Drink = { id: "a", name: "Água", group: "Águas", kind: "comprada", alcoholic: false, pack: { label: "garrafa", ml: 500 } };
  const [c] = planDrinks(10, [coca, agua]);
  assert.equal(c.liters, 4);
  assert.equal(c.packs, 12);
});

test("ficha de bebida escala pelo volume e gelo vai para Bebidas em sacos", async () => {
  const { scaleByVolume } = await import("./scale");
  const { drinkRecipes } = await import("../data/drink-recipes");
  const rec = drinkRecipes["suco-laranja"];
  const s = scaleByVolume(rec.ingredients, rec.baseLiters, 4);
  assert.equal(s[0].scaledQty, 48); // laranjas
  const list = consolidate([{ recipe: "Suco", items: s }]);
  const gelo = list.find((x) => x.name === "Gelo")!;
  assert.equal(gelo.section, "Bebidas");
  assert.equal(gelo.display, "1 saco de 5 kg");
});

test("todas as 58 receitas têm ficha completa", async () => {
  const { recipes } = await import("../data/catalog");
  assert.equal(recipes.length, 58);
  for (const r of recipes) {
    assert.ok(r.details, `sem detalhes: ${r.id}`);
    assert.ok(r.details!.steps.length >= 3 && r.details!.prep && r.details!.storage, r.id);
  }
});

test("lista converte para peso de compra", async () => {
  const list = consolidate([{ recipe: "Salpicão", items: [{ name: "Frango", qty: 500, unit: "g", note: null, group: null, scaledQty: 500 }] }]);
  assert.equal(list[0].name, "Peito de frango (cru, sem osso)");
  assert.equal(list[0].qty, 650);
  const bac = consolidate([{ recipe: "B", items: [{ name: "Bacalhau dessalgado", qty: 1, unit: "kg", note: null, group: null, scaledQty: 1 }] }]);
  assert.equal(bac[0].qty, 800);
});

test("ficha mostra unidade prática com peso de apoio", async () => {
  const { recipeQtyView } = await import("./units");
  const v = recipeQtyView("Tomate", 500, "g", formatQty);
  assert.equal(v.main, "3,5 tomates médios");
  assert.equal(v.sub, "≈ 500 g");
  assert.equal(recipeQtyView("Leite condensado", 395, "g", formatQty).sub, "≈ 1 lata");
  assert.equal(consolidate([{ recipe: "A", items: [{ name: "Água", qty: 1, unit: "l", note: null, group: null, scaledQty: 1 }] }]).length, 0);
});

test("formas: pavê para 20 pessoas vira 3 travessas; peru para 10 continua 1 peça", async () => {
  const { batchPlan } = await import("./plan");
  const { byId } = await import("../data/catalog");
  const pave = batchPlan(byId.get("pave-de-chocolate")!, 20)!;
  assert.equal(pave.count, 3);
  assert.match(pave.label, /travessas/);
  assert.equal(batchPlan(byId.get("peru-assado-tradicional")!, 10), null);
  assert.equal(batchPlan(byId.get("peru-assado-tradicional")!, 20)!.count, 3);
  assert.equal(batchPlan(byId.get("arroz-a-grega")!, 30)!.label, "2 levas");
});

test("harmonização sempre tem opção sem álcool e segurança cobre aves", async () => {
  const { pairingsFor, safetyNotes } = await import("./plan");
  const { recipes, byId } = await import("../data/catalog");
  const { drinks } = await import("../data/drinks");
  const ids = new Set(drinks.map((d) => d.id));
  for (const r of recipes) {
    const p = pairingsFor(r);
    assert.ok(p.nonAlcoholic.length > 0);
    for (const id of [...p.alcoholic, ...p.nonAlcoholic]) assert.ok(ids.has(id), id);
  }
  assert.ok(safetyNotes(byId.get("chester-assado")!).some((n) => n.includes("74 °C")));
  assert.ok(safetyNotes(byId.get("salpicao-de-frango")!).some((n) => n.includes("geladeira")));
});

test("nota de forno só aparece em receita que vai ao forno", async () => {
  const { batchPlan } = await import("./plan");
  const { byId } = await import("../data/catalog");
  assert.doesNotMatch(batchPlan(byId.get("pave-de-chocolate")!, 30)!.note, /forno/);
  assert.match(batchPlan(byId.get("pudim-de-leite-condensado")!, 30)!.note, /forno/);
});

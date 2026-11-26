/** Gera supabase/seed.sql a partir dos dados do app (fonte única). Uso: npx tsx scripts/make-seed.ts */
import { writeFileSync } from "node:fs";
import { recipes, savoryCategories, dessertCategories } from "../src/data/catalog";
import { drinks, drinkGroups } from "../src/data/drinks";
import { drinkRecipes } from "../src/data/drink-recipes";
import { pairingsFor } from "../src/engine/plan";
import { sectionFor } from "../src/engine/shopping";
import { DRINK_PARAMS } from "../src/engine/scale";

const q = (v: unknown): string =>
  v == null ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const slug = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const out: string[] = ["-- Gerado por scripts/make-seed.ts — não editar à mão", "begin;"];

const cats = [
  ...savoryCategories.map((n, i) => [slug(n), n, "salgado", i]),
  ...dessertCategories.map((n, i) => [slug(n), n, "sobremesa", 10 + i]),
  ...drinkGroups.map((n, i) => [slug(n), n, "bebida", 20 + i]),
];
for (const [id, name, kind, sort] of cats) out.push(`insert into categories values (${q(id)}, ${q(name)}, ${q(kind)}, ${sort});`);

const ingredients = new Map<string, string>();
for (const r of recipes) for (const i of r.ingredients) ingredients.set(i.name, sectionFor(i.name));
for (const [name, section] of ingredients) out.push(`insert into ingredients (name, market_section) values (${q(name)}, ${q(section)});`);

const SEASON = /^(sal|pimenta|alecrim|tomilho|louro|orégano|noz-moscada|cominho|páprica|canela|cravo|baunilha)/i;
const WHOLE = /^(peru|chester|frango|tender|chocotone|panetone|abacaxi)$/i;
for (const r of recipes) {
  const d = r.details!;
  out.push(
    `insert into recipes (id, number, name, kind, category_id, role, yield_text, base_portions, prep_time, cook_time, steps, tips, swaps, storage, scale_notes, image_path, status) values (` +
      [q(r.id), r.number, q(r.name), q(r.kind), q(slug(r.category)), q(r.role), q(r.yieldText), r.basePortions, q(d.prep), q(d.cook), j(d.steps), j(d.tips), j(d.swaps), q(d.storage), q(r.scaleNotes), q(`fotos/${r.id}.webp`), q("rascunho")].join(", ") +
      ");",
  );
  r.ingredients.forEach((i, n) => {
    const rule = i.qty == null ? "fixo" : SEASON.test(i.name) ? "tempero" : i.unit === "un" && WHOLE.test(i.name) ? "peca_inteira" : "linear";
    out.push(
      `insert into recipe_ingredients (recipe_id, ingredient_id, qty, unit, note, grp, sort, scale_rule) select ${q(r.id)}, id, ${q(i.qty)}, ${q(i.unit)}, ${q(i.note)}, ${q(i.group)}, ${n}, ${q(rule)} from ingredients where name = ${q(i.name)};`,
    );
  });
}

for (const d of drinks)
  out.push(`insert into drinks values (${q(d.id)}, ${q(d.name)}, ${q(d.group)}, ${q(d.kind)}, ${d.alcoholic}, ${q(d.pack?.label)}, ${q(d.pack?.ml)}, ${drinkRecipes[d.id] ? j(drinkRecipes[d.id]) : "null"});`);

for (const r of recipes) {
  const p = pairingsFor(r);
  for (const id of [...p.alcoholic, ...p.nonAlcoholic]) out.push(`insert into pairings values (${q(r.id)}, ${q(id)});`);
}

out.push(`insert into calc_rules values ('bebidas', ${j(DRINK_PARAMS)}, 'Consumo de bebidas por convidado');`);
out.push("commit;");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n") + "\n");
console.log(`seed.sql: ${recipes.length} receitas, ${ingredients.size} ingredientes, ${drinks.length} bebidas`);

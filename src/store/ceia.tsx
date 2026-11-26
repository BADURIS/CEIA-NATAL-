import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { byId } from "../data/catalog";
import { drinks } from "../data/drinks";
import { drinkRecipes } from "../data/drink-recipes";
import type { Role } from "../data/types";
import { planDrinks, portionsFor, roleShare, scaleByVolume, scaleRecipe, type DrinkLine, type ScaledIngredient } from "../engine/scale";
import { consolidate, sectionFor, type ShoppingItem } from "../engine/shopping";

interface Persisted {
  guests: number;
  recipeIds: string[];
  drinkIds: string[];
  checked: string[];
  removed: string[];
  edits: Record<string, string>;
  manual: { key: string; name: string; display: string }[];
}

const KEY = "ceia-facil:v1";
const empty: Persisted = { guests: 10, recipeIds: [], drinkIds: [], checked: [], removed: [], edits: {}, manual: [] };

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

export interface CeiaLine {
  id: string;
  share: number;
  portions: number;
  items: ScaledIngredient[];
}

interface Ctx extends Persisted {
  setGuests: (n: number) => void;
  toggleRecipe: (id: string) => void;
  toggleDrink: (id: string) => void;
  hasRecipe: (id: string) => boolean;
  hasDrink: (id: string) => boolean;
  lines: CeiaLine[];
  drinkLines: DrinkLine[];
  shopping: ShoppingItem[];
  toggleChecked: (key: string) => void;
  removeItem: (key: string) => void;
  editItem: (key: string, display: string) => void;
  addManual: (name: string, display: string) => void;
  resetList: () => void;
}

const CeiaContext = createContext<Ctx | null>(null);

export function CeiaProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* armazenamento indisponível: segue em memória */
    }
  }, [s]);

  const lines = useMemo<CeiaLine[]>(() => {
    const counts = new Map<Role, number>();
    for (const id of s.recipeIds) {
      const r = byId.get(id);
      if (r) counts.set(r.role, (counts.get(r.role) ?? 0) + 1);
    }
    return s.recipeIds.flatMap((id) => {
      const r = byId.get(id);
      if (!r) return [];
      const share = roleShare(r.role, counts.get(r.role) ?? 1);
      return [{ id, share, portions: portionsFor(s.guests, share), items: scaleRecipe(r, s.guests, share) }];
    });
  }, [s.recipeIds, s.guests]);

  const drinkLines = useMemo(
    () => planDrinks(s.guests, drinks.filter((d) => s.drinkIds.includes(d.id))),
    [s.drinkIds, s.guests],
  );

  const shopping = useMemo(() => {
    const prepared = drinkLines
      .filter((d) => drinkRecipes[d.drink.id])
      .map((d) => {
        const rec = drinkRecipes[d.drink.id];
        return { recipe: d.drink.name, items: scaleByVolume(rec.ingredients, rec.baseLiters, d.liters) };
      });
    const bought = drinkLines.filter((d) => !drinkRecipes[d.drink.id]);
    const base = consolidate([...lines.map((l) => ({ recipe: byId.get(l.id)!.name, items: l.items })), ...prepared], bought)
      .filter((i) => !s.removed.includes(i.key))
      .map((i) => (s.edits[i.key] ? { ...i, display: s.edits[i.key], packHint: null } : i));
    const manual: ShoppingItem[] = s.manual.map((m) => ({
      key: m.key, name: m.name, qty: null, unit: null, display: m.display, packHint: null,
      section: sectionFor(m.name), sources: ["Adicionado por você"], manual: true,
    }));
    return [...base, ...manual];
  }, [lines, drinkLines, s.removed, s.edits, s.manual]);

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const value: Ctx = {
    ...s,
    lines,
    drinkLines,
    shopping,
    setGuests: (n) => setS((p) => ({ ...p, guests: Math.min(80, Math.max(1, Math.round(n))) })),
    toggleRecipe: (id) => setS((p) => ({ ...p, recipeIds: toggle(p.recipeIds, id) })),
    toggleDrink: (id) => setS((p) => ({ ...p, drinkIds: toggle(p.drinkIds, id) })),
    hasRecipe: (id) => s.recipeIds.includes(id),
    hasDrink: (id) => s.drinkIds.includes(id),
    toggleChecked: (key) => setS((p) => ({ ...p, checked: toggle(p.checked, key) })),
    removeItem: (key) =>
      setS((p) => ({ ...p, removed: [...p.removed, key], manual: p.manual.filter((m) => m.key !== key) })),
    editItem: (key, display) =>
      setS((p) =>
        p.manual.some((m) => m.key === key)
          ? { ...p, manual: p.manual.map((m) => (m.key === key ? { ...m, display } : m)) }
          : { ...p, edits: { ...p.edits, [key]: display } },
      ),
    addManual: (name, display) =>
      setS((p) => ({ ...p, manual: [...p.manual, { key: `manual|${Date.now()}`, name, display }] })),
    resetList: () => setS((p) => ({ ...p, checked: [], removed: [], edits: {}, manual: [] })),
  };

  return <CeiaContext.Provider value={value}>{children}</CeiaContext.Provider>;
}

export function useCeia() {
  const c = useContext(CeiaContext);
  if (!c) throw new Error("useCeia fora do CeiaProvider");
  return c;
}

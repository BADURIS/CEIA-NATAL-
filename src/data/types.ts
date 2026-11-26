export type Unit = "g" | "kg" | "ml" | "l" | "un" | "dente" | "ramo" | "folha" | "lata" | "caixa" | "pé";

export interface Ingredient {
  name: string;
  qty: number | null;
  unit: Unit | null;
  note: string | null;
  group: string | null;
}

export type Role = "principal" | "acompanhamento" | "salada" | "entrada" | "sobremesa";

export interface Recipe {
  id: string;
  number: number;
  name: string;
  kind: "salgado" | "sobremesa";
  category: string;
  role: Role;
  yieldText: string;
  basePortions: number;
  ingredients: Ingredient[];
  method: string;
  scaleNotes: string;
  status: "rascunho" | "revisado";
  details?: RecipeDetails;
}

export interface RecipeDetails {
  prep: string;
  cook: string;
  steps: string[];
  tips: string[];
  swaps: string[];
  storage: string;
}

export type DrinkKind = "comprada" | "preparada";

export interface Drink {
  id: string;
  name: string;
  group: string;
  kind: DrinkKind;
  alcoholic: boolean;
  /** Embalagem de compra para bebidas compradas. */
  pack?: { label: string; ml: number };
  note?: string;
}

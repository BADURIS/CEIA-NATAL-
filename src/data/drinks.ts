import type { Drink } from "./types";

/** Catálogo oficial econômico de bebidas (sem marcas de vinho/espumante). */
export const drinks: Drink[] = [
  { id: "espumante", name: "Espumante", group: "Espumante", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "vinho-tinto-seco", name: "Vinho tinto seco", group: "Vinhos", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "vinho-tinto-suave", name: "Vinho tinto suave", group: "Vinhos", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "vinho-branco-seco", name: "Vinho branco seco", group: "Vinhos", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "vinho-branco-suave", name: "Vinho branco suave", group: "Vinhos", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "vinho-rose", name: "Vinho rosé", group: "Vinhos", kind: "comprada", alcoholic: true, pack: { label: "garrafa 750 ml", ml: 750 } },
  { id: "caipirinha", name: "Caipirinha", group: "Drinks", kind: "preparada", alcoholic: true, note: "Ficha de preparo" },
  { id: "caipiroska", name: "Caipiroska", group: "Drinks", kind: "preparada", alcoholic: true, note: "Ficha de preparo" },
  { id: "suco-laranja", name: "Suco de laranja", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "suco-abacaxi", name: "Suco de abacaxi", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "suco-maracuja", name: "Suco de maracujá", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "suco-melancia", name: "Suco de melancia", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "limonada", name: "Limonada", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "suco-abacaxi-hortela", name: "Suco de abacaxi com hortelã", group: "Sucos naturais", kind: "preparada", alcoholic: false, note: "Ficha de preparo" },
  { id: "coca-cola", name: "Coca-Cola", group: "Refrigerantes", kind: "comprada", alcoholic: false, pack: { label: "garrafa 2 L", ml: 2000 } },
  { id: "guarana", name: "Guaraná", group: "Refrigerantes", kind: "comprada", alcoholic: false, pack: { label: "garrafa 2 L", ml: 2000 } },
  { id: "sprite", name: "Sprite", group: "Refrigerantes", kind: "comprada", alcoholic: false, pack: { label: "garrafa 2 L", ml: 2000 } },
  { id: "fanta", name: "Fanta", group: "Refrigerantes", kind: "comprada", alcoholic: false, pack: { label: "garrafa 2 L", ml: 2000 } },
  { id: "agua-com-gas", name: "Água com gás", group: "Águas", kind: "comprada", alcoholic: false, pack: { label: "garrafa 1,5 L", ml: 1500 }, note: "Servida em jarras de 1,5 L" },
  { id: "agua-com-limao", name: "Água com limão", group: "Águas", kind: "preparada", alcoholic: false, note: "Ficha simples" },
];

export const drinkGroups = ["Espumante", "Vinhos", "Drinks", "Sucos naturais", "Refrigerantes", "Águas"];

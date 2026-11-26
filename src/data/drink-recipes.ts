import type { Ingredient, Unit } from "./types";

/** Fichas das bebidas preparadas em casa (rascunho, não testadas). */
export interface DrinkRecipe {
  baseLiters: number;
  yieldText: string;
  prep: string;
  ingredients: Ingredient[];
  steps: string[];
  tips: string[];
  storage: string;
}

const i = (name: string, qty: number | null, unit: Unit | null, note: string | null = null): Ingredient => ({ name, qty, unit, note, group: null });

const ICE = i("Gelo", 1, "kg");

export const drinkRecipes: Record<string, DrinkRecipe> = {
  caipirinha: {
    baseLiters: 1.5, yieldText: "10 copos (cerca de 1,5 L com gelo)", prep: "15 min",
    ingredients: [i("Limão taiti", 10, "un", "médio"), i("Açúcar", 20, "colher-sopa"), i("Cachaça", 500, "ml"), i("Gelo", 2, "kg")],
    steps: ["Lave os limões, corte as pontas, retire o miolo branco e corte em 8 pedaços.", "Em cada copo, coloque 1 limão picado e 2 colheres de sopa de açúcar e amasse com socador.", "Complete com gelo e 50 ml de cachaça.", "Misture bem e sirva na hora."],
    tips: ["Tirar o miolo branco do limão evita o amargo.", "Ofereça a versão sem álcool: troque a cachaça por água com gás."],
    storage: "Prepare na hora. Limões podem ser cortados com 2 h de antecedência, na geladeira.",
  },
  caipiroska: {
    baseLiters: 1.5, yieldText: "10 copos (cerca de 1,5 L com gelo)", prep: "15 min",
    ingredients: [i("Limão taiti", 10, "un", "médio"), i("Açúcar", 20, "colher-sopa"), i("Vodca", 500, "ml"), i("Gelo", 2, "kg")],
    steps: ["Lave os limões, retire as pontas e o miolo branco e corte em 8 pedaços.", "Em cada copo, amasse 1 limão com 2 colheres de sopa de açúcar.", "Complete com gelo e 50 ml de vodca.", "Misture e sirva na hora."],
    tips: ["Varie a fruta: morango, maracujá ou abacaxi funcionam com a mesma base."],
    storage: "Prepare na hora.",
  },
  "suco-laranja": {
    baseLiters: 2, yieldText: "2 litros (cerca de 8 copos de 250 ml)", prep: "20 min",
    ingredients: [i("Laranja-pera", 24, "un", "média"), i("Açúcar", null, null, "opcional, a gosto"), ICE],
    steps: ["Lave as laranjas, corte ao meio e esprema.", "Coe se preferir sem bagaço.", "Sirva com gelo. Adoce só se precisar."],
    tips: ["Laranja-pera é a que mais rende suco e costuma ser a mais barata."],
    storage: "Geladeira por até 1 dia, em jarra fechada. Melhor feito no dia.",
  },
  "suco-abacaxi": {
    baseLiters: 3, yieldText: "3 litros (cerca de 12 copos)", prep: "15 min",
    ingredients: [i("Abacaxi", 2, "un", "médio, cerca de 1,5 kg cada"), i("Água filtrada", 2, "l"), i("Açúcar", null, null, "opcional, a gosto"), ICE],
    steps: ["Descasque o abacaxi e corte em pedaços, sem o miolo duro.", "Bata no liquidificador com a água, em duas levas.", "Coe e sirva com gelo."],
    tips: ["Abacaxi bem maduro dispensa açúcar."],
    storage: "Geladeira por até 1 dia.",
  },
  "suco-maracuja": {
    baseLiters: 2.5, yieldText: "2,5 litros (cerca de 10 copos)", prep: "15 min",
    ingredients: [i("Maracujá azedo", 6, "un", "grande"), i("Água filtrada", 2, "l"), i("Açúcar", 12, "colher-sopa"), ICE],
    steps: ["Corte os maracujás e retire a polpa.", "Bata a polpa com parte da água por poucos segundos, só para soltar as sementes.", "Coe, junte o restante da água e o açúcar e misture.", "Sirva gelado."],
    tips: ["Bater pouco evita triturar as sementes e amargar o suco."],
    storage: "Geladeira por até 2 dias.",
  },
  "suco-melancia": {
    baseLiters: 2, yieldText: "2 litros (cerca de 8 copos)", prep: "15 min",
    ingredients: [i("Melancia", 1, "un", "pequena, cerca de 3 kg"), i("Hortelã", 2, "ramo", "opcional"), ICE],
    steps: ["Corte a melancia em cubos e retire as sementes.", "Bata no liquidificador sem água, em levas.", "Coe se preferir e sirva com gelo e hortelã."],
    tips: ["Melancia não precisa de água nem de açúcar."],
    storage: "Consumir no dia; separa com o tempo, mexa antes de servir.",
  },
  limonada: {
    baseLiters: 1.6, yieldText: "1,6 litro (cerca de 6 copos)", prep: "10 min",
    ingredients: [i("Limão taiti", 6, "un", "médio"), i("Água filtrada", 1.5, "l"), i("Açúcar", 10, "colher-sopa"), ICE],
    steps: ["Lave bem os limões e corte em quatro, retirando as pontas.", "Bata com a água e o açúcar por no máximo 5 segundos.", "Coe imediatamente e sirva com gelo."],
    tips: ["Bater mais que 5 segundos deixa a limonada amarga."],
    storage: "Consumir em até 2 horas.",
  },
  "suco-abacaxi-hortela": {
    baseLiters: 3, yieldText: "3 litros (cerca de 12 copos)", prep: "15 min",
    ingredients: [i("Abacaxi", 2, "un", "médio"), i("Água filtrada", 2, "l"), i("Hortelã", 4, "ramo"), i("Açúcar", null, null, "opcional, a gosto"), ICE],
    steps: ["Descasque o abacaxi e corte em pedaços.", "Bata com a água e as folhas de hortelã, em duas levas.", "Coe e sirva gelado."],
    tips: ["Use só as folhas da hortelã: o talo amarga."],
    storage: "Geladeira por até 1 dia.",
  },
  "agua-com-limao": {
    baseLiters: 2, yieldText: "2 litros", prep: "5 min",
    ingredients: [i("Água filtrada", 2, "l"), i("Limão taiti", 2, "un", "médio"), ICE],
    steps: ["Lave os limões e corte em rodelas finas.", "Coloque na jarra com a água e o gelo.", "Deixe 15 minutos na geladeira antes de servir."],
    tips: ["Algumas folhas de hortelã deixam ainda mais refrescante."],
    storage: "Retire os limões após 4 horas para não amargar.",
  },
};

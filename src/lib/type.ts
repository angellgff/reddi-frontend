export const API_DELAY = 200; // Simula un retraso de 200ms * 1-10 aleatorio

// Los value son los valores que se guardarán en la "base de datos"
// Las labels son las que se mostrarán en el UI

export type Hours = Record<
  string,
  { active: boolean; opens: string; closes: string }
>;

export type valueCategories =
  | "market"
  | "restaurant"
  | "alcohol"
  | "pharmacy"
  | "tobacco";
export type valueDishesTags = "tag1" | "tag2" | "tag3" | "tag4";

export const partnersCategories: Array<{
  value: valueCategories;
  label: string;
}> = [
  { value: "market", label: "Mercado" },
  { value: "restaurant", label: "Restaurante" },
  { value: "alcohol", label: "Alcohol" },
  { value: "pharmacy", label: "Farmacia" },
  { value: "tobacco", label: "Tabaco" },
];

export const productCategories: Array<{ value: string; label: string }> = [
  { value: "bebidas", label: "Bebidas" },
  { value: "verduras", label: "Verduras" },
  { value: "licores", label: "Licores" },
];

export const dishesTags = [
  { value: "tag1", label: "Entrada" },
  { value: "tag2", label: "Platos fuertes" },
  { value: "tag3", label: "Bebidas" },
  { value: "tag4", label: "Postres" },
];

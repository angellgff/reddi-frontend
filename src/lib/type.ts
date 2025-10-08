export const API_DELAY = 200; // Simula un retraso de 200ms * 1-10 aleatorio

// Los value son los valores que se guardarán en la "base de datos"
// Las labels son las que se mostrarán en el UI

export type Hours = Record<
  string,
  { active: boolean; opens: string; closes: string }
>;

export type valueAccounts = "savings" | "checking";

export const accountTypeOptions: Array<{
  value: valueAccounts;
  label: string;
}> = [
  { value: "savings", label: "Ahorros" },
  { value: "checking", label: "Corriente" },
];

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

// Tipo para el catálogo de extras que obtendremos de la BD
export interface ProductExtra {
  id: string; // uuid
  name: string;
  default_price: number;
  image_url?: string | null;
}

// Tipo para las categorías que obtendremos de la BD
export interface Category {
  id: string; // uuid
  name: string;
}

// MODIFICADO: Esta es la opción seleccionada por el usuario.
// No crea un extra, sino que lo referencia.
export type DishOptionSelection = {
  // id temporal para el estado de React
  tempId: string;
  // FK a la tabla product_extras
  extraId: string | null;
  // Precio opcional que sobreescribe el default_price del extra
  overridePrice: string;
};

// MODIFICADO: La sección ahora contiene selecciones de opciones, no opciones nuevas.
export type DishSection = {
  // id temporal para el estado de React
  tempId: string;
  name: string;
  isRequired: boolean;
  options: DishOptionSelection[];
};

// MODIFICADO: El estado principal del formulario
export interface IDishFormState {
  image: File | string | null;
  dishName: string;
  basePrice: string;
  previousPrice: string;
  discount: string;
  unit: string;
  estimatedTime: string;
  description: string;
  // Ahora será el ID de la categoría
  categoryId: string;
  isAvailable: boolean;
  taxIncluded: boolean;
  dishSections: DishSection[];
}

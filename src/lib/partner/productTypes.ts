// Tipos para creación de productos alineados al esquema actual
// Basado en tablas: products, product_sections, product_section_options, product_extras, sub_categories

export interface ProductExtra {
  id: string;
  name: string;
  defaultPrice: number; // maps default_price
  imageUrl?: string | null;
  partnerId: string;
}

export interface ProductSubCategory {
  id: string; // sub_categories.id
  name: string;
  categoryId: string | null; // FK a categories (puede ser null según schema)
}

// Selección de un extra (no crea extra, lo referencia)
export interface SectionExtraSelection {
  clientId: string; // id temporal para React
  extraId: string | null; // id de product_extras
  overridePrice: string; // string para el input, se parsea a number|null en server
}

export interface ProductSectionForm {
  clientId: string;
  name: string;
  isRequired: boolean;
  options: SectionExtraSelection[];
}

export interface CreateProductFormState {
  image: File | null; // imagen principal temporal (no se envía directo)
  name: string;
  basePrice: string;
  previousPrice: string;
  discountPercent: string; // porcentaje de descuento (opcional)
  unit: string;
  estimatedTimeRange: string; // formato "10-20min"
  description: string;
  subCategoryId: string | null; // FK sub_category_id
  isAvailable: boolean;
  taxIncluded: boolean;
  sections: ProductSectionForm[];
}

// Payload final para server action (sin File)
export interface CreateProductPayload {
  product: {
    name: string;
    basePrice: number;
    previousPrice: number | null;
    discountPercentage: number | null;
    unit: string;
    estimatedTime: string; // se guarda tal cual (estimated_time)
    description: string | null;
    subCategoryId: string; // requerido en BD
    isAvailable: boolean;
    taxIncluded: boolean;
  };
  sections: Array<{
    tempId: string;
    name: string;
    isRequired: boolean;
    order: number;
    options: Array<{
      extraId: string;
      overridePrice: number | null;
      order: number;
    }>;
  }>;
}

// Resultado de createDishAction
export interface CreateDishResult {
  productId: string;
}

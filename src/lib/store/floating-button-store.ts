import { create } from "zustand";

export type FloatingMode =
  | "search"
  | "product"
  | "product-details"
  | "store"
  | "cart"
  | "loading"
  | "hidden";

interface FloatingButtonState {
  mode: FloatingMode;
  text: string; // Used for "Store Name" or generic button text
  secondaryText?: string; // Used for "Discount" text
  action?: () => void;
  secondaryAction?: () => void;
  disabled?: boolean;

  // Product Details specific
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;

  // Methods
  showSearch: () => void;
  showProduct: (action: () => void) => void;
  showProductDetails: (options: {
    text?: string;
    secondaryText?: string;
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    action: () => void;
    disabled?: boolean;
  }) => void;
  showStore: (
    storeName: string,
    discountText?: string,
    action?: () => void,
  ) => void;
  showCartButton: (text?: string, action?: () => void) => void;
  showLoading: (text?: string) => void;
  hideButton: () => void;
}

export const useFloatingButtonStore = create<FloatingButtonState>((set) => ({
  mode: "search",
  text: "",
  secondaryText: "",
  action: undefined,
  secondaryAction: undefined,
  disabled: false,
  quantity: 1,
  onIncrement: undefined,
  onDecrement: undefined,

  showSearch: () =>
    set({
      mode: "search",
      text: "",
      secondaryText: "",
      action: undefined,
      onIncrement: undefined,
      onDecrement: undefined,
      disabled: false,
    }),

  showProduct: (action) =>
    set({
      mode: "product",
      text: "Añade un Producto",
      action,
      onIncrement: undefined,
      onDecrement: undefined,
      disabled: false,
    }),

  showProductDetails: ({
    text = "Agregar",
    secondaryText,
    quantity,
    onIncrement,
    onDecrement,
    action,
    disabled = false,
  }) =>
    set({
      mode: "product-details",
      text,
      secondaryText,
      quantity,
      onIncrement,
      onDecrement,
      action,
      disabled,
    }),

  showStore: (storeName, discountText, action) =>
    set({
      mode: "store",
      text: storeName,
      secondaryText: discountText,
      action,
      onIncrement: undefined,
      onDecrement: undefined,
      disabled: false,
    }),

  showCartButton: (text = "Ver Carrito", action) =>
    set({
      mode: "cart",
      text,
      action,
      onIncrement: undefined,
      onDecrement: undefined,
    }),

  showLoading: (text = "Agregando...") =>
    set({
      mode: "loading",
      text,
      action: undefined,
      onIncrement: undefined,
      onDecrement: undefined,
    }),

  hideButton: () =>
    set({
      mode: "hidden",
      text: "",
      secondaryText: "",
      action: undefined,
      onIncrement: undefined,
      onDecrement: undefined,
    }),
}));

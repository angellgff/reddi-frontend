import { create } from "zustand";

export type FloatingMode =
  | "search"
  | "product"
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

  // Methods
  showSearch: () => void;
  showProduct: (action: () => void) => void;
  showStore: (
    storeName: string,
    discountText?: string,
    action?: () => void
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

  showSearch: () =>
    set({ mode: "search", text: "", secondaryText: "", action: undefined }),

  showProduct: (action) =>
    set({ mode: "product", text: "Añade un Producto", action }),

  showStore: (storeName, discountText, action) =>
    set({
      mode: "store",
      text: storeName,
      secondaryText: discountText,
      action,
    }),

  showCartButton: (text = "Ver Carrito", action) =>
    set({ mode: "cart", text, action }),

  showLoading: (text = "Agregando...") => set({ mode: "loading", text }),

  hideButton: () =>
    set({ mode: "hidden", text: "", secondaryText: "", action: undefined }),
}));

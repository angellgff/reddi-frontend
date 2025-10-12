import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

// Tipos base según Supabase
export type ProductId = string; // products.id
export type ProductExtraId = string; // product_extras.id

export interface SelectedExtra {
  id: string; // client id
  extraId: ProductExtraId; // FK to product_extras
  name: string;
  price: number; // override o default
}

export interface CartItem {
  id: string; // client id
  productId: ProductId;
  partnerId: string; // para agrupar por restaurante/partner
  name: string;
  imageUrl?: string | null;
  unitPrice: number; // base_price con descuento aplicado si existe
  quantity: number;
  extras: SelectedExtra[];
  // opcional: notas, variantes, etc.
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

// Helpers
const calcItemTotal = (item: CartItem) => {
  const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
  return (item.unitPrice + extrasTotal) * item.quantity;
};

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state: CartState,
      action: PayloadAction<
        Omit<CartItem, "id"> & { id?: string; mergeByProduct?: boolean }
      >
    ) => {
      const {
        id = nanoid(),
        mergeByProduct = true,
        productId,
        partnerId,
        name,
        imageUrl,
        unitPrice,
        quantity,
        extras,
      } = action.payload;

      if (mergeByProduct) {
        const found = state.items.find(
          (i: CartItem) =>
            i.productId === productId &&
            i.partnerId === partnerId &&
            JSON.stringify(
              i.extras.map((e: SelectedExtra) => e.extraId).sort()
            ) ===
              JSON.stringify(extras.map((e: SelectedExtra) => e.extraId).sort())
        );
        if (found) {
          found.quantity += quantity;
          return;
        }
      }

      state.items.push({
        id,
        productId,
        partnerId,
        name,
        imageUrl,
        unitPrice,
        quantity,
        extras,
      });
    },
    removeItem: (state: CartState, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter(
        (i: CartItem) => i.id !== action.payload.id
      );
    },
    setQuantity: (
      state: CartState,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (it) {
        it.quantity = Math.max(1, action.payload.quantity);
      }
    },
    addExtraToItem: (
      state: CartState,
      action: PayloadAction<{ id: string; extra: Omit<SelectedExtra, "id"> }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (it) {
        it.extras.push({ id: nanoid(), ...action.payload.extra });
      }
    },
    removeExtraFromItem: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (it) {
        it.extras = it.extras.filter(
          (e: SelectedExtra) => e.id !== action.payload.extraId
        );
      }
    },
    clearCart: (state: CartState) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  setQuantity,
  addExtraToItem,
  removeExtraFromItem,
  clearCart,
} = cartSlice.actions;

// Selectores
export const selectCartItems = (s: { cart: CartState }) => s.cart.items;
export const selectCartCount = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, it) => acc + it.quantity, 0);
export const selectCartSubtotal = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, it) => acc + calcItemTotal(it), 0);

export default cartSlice.reducer;

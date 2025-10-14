import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

// Tipos base según Supabase
export type ProductId = string; // products.id
export type ProductExtraId = string; // product_extras.id

export interface SelectedExtra {
  id: string; // client id
  imageUrl?: string | null;
  extraId: ProductExtraId; // FK to product_extras
  name: string;
  price: number; // override o default
  quantity: number; // cantidad por extra
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
  note?: string | null;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

// Helpers
const calcItemTotal = (item: CartItem) => {
  const extrasTotalPerUnit = item.extras.reduce(
    (s, e) => s + e.price * e.quantity,
    0
  );
  return (item.unitPrice + extrasTotalPerUnit) * item.quantity;
};

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state: CartState, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload ?? [];
    },
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
        note,
      } = action.payload;

      // Si el item tiene extras, no hacemos merge y forzamos líneas unitarias
      if (extras && extras.length > 0) {
        const times = Math.max(1, quantity);
        for (let i = 0; i < times; i++) {
          state.items.push({
            id: nanoid(),
            productId,
            partnerId,
            name,
            imageUrl,
            unitPrice,
            quantity: 1,
            extras: extras.map((e) => ({
              id: nanoid(),
              imageUrl: e.imageUrl ?? null,
              extraId: e.extraId,
              name: e.name,
              price: e.price,
              quantity: e.quantity,
            })),
            note: note ?? null,
          });
        }
        return;
      }

      if (mergeByProduct) {
        const found = state.items.find(
          (i: CartItem) =>
            i.productId === productId &&
            i.partnerId === partnerId &&
            (i.extras?.length ?? 0) === 0 &&
            // Merge solo si la nota coincide (tratando undefined y "" como iguales)
            (i.note ?? "") === (note ?? "")
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
        extras: [],
        note: note ?? null,
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
      const itIdx = state.items.findIndex(
        (i: CartItem) => i.id === action.payload.id
      );
      if (itIdx === -1) return;
      const it = state.items[itIdx];
      const nextQty = Math.max(1, action.payload.quantity);

      if (nextQty === it.quantity) return;

      // Si el item tiene extras y se intenta aumentar su cantidad,
      // no multiplicamos los extras. En su lugar, creamos nuevas líneas
      // base (sin extras) por cada incremento requerido.
      if (nextQty > it.quantity && it.extras.length > 0) {
        const inc = nextQty - it.quantity;
        for (let k = 0; k < inc; k++) {
          state.items.push({
            id: nanoid(),
            productId: it.productId,
            partnerId: it.partnerId,
            name: it.name,
            imageUrl: it.imageUrl,
            unitPrice: it.unitPrice,
            quantity: 1,
            extras: [],
            note: it.note ?? null,
          });
        }
        // La línea original mantiene su cantidad intacta (no se cambia)
        return;
      }

      // Caso normal (sin extras o disminuir cantidad): actualizar la cantidad directamente
      it.quantity = nextQty;
    },
    addExtraToItem: (
      state: CartState,
      action: PayloadAction<{
        id: string;
        extra: Omit<SelectedExtra, "id" | "quantity"> & { quantity?: number };
      }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;

      // Nueva regla: si agregamos un extra a un producto con cantidad > 1,
      // dividimos: restamos 1 a la línea actual y creamos una nueva línea con qty=1 y el extra.
      if (it.quantity > 1) {
        it.quantity -= 1;
        // Copiamos los extras actuales a la nueva línea (para no perder configuración)
        const newExtras: SelectedExtra[] = it.extras.map((e) => ({
          id: nanoid(),
          imageUrl: e.imageUrl ?? null,
          extraId: e.extraId,
          name: e.name,
          price: e.price,
          quantity: e.quantity,
        }));
        // Agregamos o incrementamos el extra nuevo en la nueva línea
        const target = newExtras.find(
          (e) => e.extraId === action.payload.extra.extraId
        );
        if (target) target.quantity += action.payload.extra.quantity ?? 1;
        else
          newExtras.push({
            id: nanoid(),
            imageUrl: action.payload.extra.imageUrl ?? null,
            extraId: action.payload.extra.extraId,
            name: action.payload.extra.name,
            price: action.payload.extra.price,
            quantity: action.payload.extra.quantity ?? 1,
          });

        const newItem: CartItem = {
          id: nanoid(),
          productId: it.productId,
          partnerId: it.partnerId,
          name: it.name,
          imageUrl: it.imageUrl,
          unitPrice: it.unitPrice,
          quantity: 1,
          extras: newExtras,
          note: it.note ?? null,
        };
        state.items.push(newItem);
        return;
      }

      // Caso normal (qty === 1): agregar/incrementar el extra en la misma línea
      const existing = it.extras.find(
        (e: SelectedExtra) => e.extraId === action.payload.extra.extraId
      );
      if (existing) {
        existing.quantity += action.payload.extra.quantity ?? 1;
      } else {
        it.extras.push({
          id: nanoid(),
          quantity: action.payload.extra.quantity ?? 1,
          ...action.payload.extra,
        });
      }
    },
    incrementExtraQuantity: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;
      const ex = it.extras.find((e) => e.extraId === action.payload.extraId);
      if (ex) ex.quantity += 1;
    },
    decrementExtraQuantity: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;
      const exIdx = it.extras.findIndex(
        (e) => e.extraId === action.payload.extraId
      );
      if (exIdx === -1) return;
      const ex = it.extras[exIdx];
      if (ex.quantity > 1) ex.quantity -= 1;
      else it.extras.splice(exIdx, 1);
    },
    removeExtraFromItem: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (it) {
        it.extras = it.extras.filter(
          (e: SelectedExtra) => e.extraId !== action.payload.extraId
        );
      }
    },
    updateItemNote: (
      state: CartState,
      action: PayloadAction<{ id: string; note: string | null }>
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;
      it.note =
        action.payload.note && action.payload.note.trim() !== ""
          ? action.payload.note.trim()
          : null;
    },
    clearCart: (state: CartState) => {
      state.items = [];
    },
  },
});

export const {
  setCartItems,
  addItem,
  removeItem,
  setQuantity,
  addExtraToItem,
  incrementExtraQuantity,
  decrementExtraQuantity,
  removeExtraFromItem,
  updateItemNote,
  clearCart,
} = cartSlice.actions;

// Selectores
export const selectCartItems = (s: { cart: CartState }) => s.cart.items;
export const selectCartCount = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, it) => acc + it.quantity, 0);
export const selectCartSubtotal = (s: { cart: CartState }) =>
  s.cart.items.reduce((acc, it) => acc + calcItemTotal(it), 0);

export default cartSlice.reducer;

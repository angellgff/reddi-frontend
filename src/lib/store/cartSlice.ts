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

export interface SelectedVariant {
  id: string; // client id
  variantId: string; // FK to product_variants
  groupName: string;
  name: string;
  price: number; // IMPORTANTE: Normalmente es 0 si el precio ya está incluido en unitPrice
}

export interface CartItem {
  id: string; // client id
  productId: ProductId;
  partnerId: string; // para agrupar por restaurante/partner
  name: string;
  imageUrl?: string | null;
  unitPrice: number; // PRECIO FINAL (Base o Variante)
  quantity: number;
  measurementUnit?: string;
  extras: SelectedExtra[];
  variants?: SelectedVariant[];
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
    0,
  );
  // Nota: Si usas unitPrice como el precio de la variante,
  // asegúrate de que v.price sea 0 al hacer dispatch, o se sumará doble.
  const variantsTotalPerUnit = (item.variants || []).reduce(
    (s, v) => s + v.price,
    0,
  );
  return (
    (item.unitPrice + extrasTotalPerUnit + variantsTotalPerUnit) * item.quantity
  );
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
      >,
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
        variants,
        note,
      } = action.payload;

      // 1. Si el item tiene EXTRAS, forzamos líneas separadas (no merge).
      // Esto es porque los extras suelen ser personalizaciones únicas.
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
            extras: (extras || []).map((e) => ({
              id: nanoid(),
              imageUrl: e.imageUrl ?? null,
              extraId: e.extraId,
              name: e.name,
              price: e.price,
              quantity: e.quantity,
            })),
            variants: variants || [], // Pasamos las variantes
            note: note ?? null,
          });
        }
        return;
      }

      // 2. Intento de MERGE (Agrupar)
      // Agrupamos si: Mismo Producto + Misma Variante + Misma Nota + Sin Extras
      if (mergeByProduct) {
        const found = state.items.find((i: CartItem) => {
          // Chequeos básicos
          if (i.productId !== productId || i.partnerId !== partnerId)
            return false;
          if ((i.note ?? "") !== (note ?? "")) return false;
          // Solo mergeamos si el existente tampoco tiene extras
          if ((i.extras?.length ?? 0) > 0) return false;

          // Chequeo de Variantes (Array Deep Check simplificado)
          // Asumimos que si tienen variantes, el ID de la primera debe coincidir.
          const incomingVariantId = variants?.[0]?.variantId;
          const existingVariantId = i.variants?.[0]?.variantId;

          return incomingVariantId === existingVariantId;
        });

        if (found) {
          found.quantity += quantity;
          return;
        }
      }

      // 3. Si no se agrupó, crear nueva línea
      state.items.push({
        id,
        productId,
        partnerId,
        name,
        imageUrl,
        unitPrice,
        quantity,
        extras: [], // Ya validamos arriba que si tenía extras entraba en el paso 1
        variants: variants || [],
        note: note ?? null,
      });
    },
    removeItem: (state: CartState, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter(
        (i: CartItem) => i.id !== action.payload.id,
      );
    },
    setQuantity: (
      state: CartState,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const itIdx = state.items.findIndex(
        (i: CartItem) => i.id === action.payload.id,
      );
      if (itIdx === -1) return;
      const it = state.items[itIdx];
      const nextQty = Math.max(1, action.payload.quantity);

      if (nextQty === it.quantity) return;

      // Si aumentamos cantidad y tiene extras, dividimos en nuevas líneas
      // para permitir personalización futura individual.
      // Si tiene variantes PERO NO extras, simplemente subimos la cantidad (ej: 2 Pizzas Grandes iguales).
      if (nextQty > it.quantity && it.extras.length > 0) {
        const inc = nextQty - it.quantity;
        for (let k = 0; k < inc; k++) {
          state.items.push({
            ...JSON.parse(JSON.stringify(it)), // Deep copy rápido
            id: nanoid(),
            quantity: 1,
          });
        }
        return;
      }

      // Caso normal
      it.quantity = nextQty;
    },
    addExtraToItem: (
      state: CartState,
      action: PayloadAction<{
        id: string;
        extra: Omit<SelectedExtra, "id" | "quantity"> & { quantity?: number };
      }>,
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;

      // Si agregamos extra a item con cantidad > 1, separamos uno
      if (it.quantity > 1) {
        it.quantity -= 1;
        const newItem: CartItem = {
          ...JSON.parse(JSON.stringify(it)), // Copia profunda para extras/variantes
          id: nanoid(),
          quantity: 1,
        };

        // Agregar el extra al nuevo item
        const existingExtra = newItem.extras.find(
          (e) => e.extraId === action.payload.extra.extraId,
        );
        if (existingExtra) {
          existingExtra.quantity += action.payload.extra.quantity ?? 1;
        } else {
          newItem.extras.push({
            id: nanoid(),
            ...action.payload.extra,
            quantity: action.payload.extra.quantity ?? 1,
          });
        }
        state.items.push(newItem);
        return;
      }

      // Agregar al item actual (qty 1)
      const existing = it.extras.find(
        (e: SelectedExtra) => e.extraId === action.payload.extra.extraId,
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
      action: PayloadAction<{ id: string; extraId: string }>,
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;
      const ex = it.extras.find((e) => e.extraId === action.payload.extraId);
      if (ex) ex.quantity += 1;
    },
    decrementExtraQuantity: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>,
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (!it) return;
      const exIdx = it.extras.findIndex(
        (e) => e.extraId === action.payload.extraId,
      );
      if (exIdx === -1) return;
      const ex = it.extras[exIdx];
      if (ex.quantity > 1) ex.quantity -= 1;
      else it.extras.splice(exIdx, 1);
    },
    removeExtraFromItem: (
      state: CartState,
      action: PayloadAction<{ id: string; extraId: string }>,
    ) => {
      const it = state.items.find((i: CartItem) => i.id === action.payload.id);
      if (it) {
        it.extras = it.extras.filter(
          (e: SelectedExtra) => e.extraId !== action.payload.extraId,
        );
      }
    },
    updateItemNote: (
      state: CartState,
      action: PayloadAction<{ id: string; note: string | null }>,
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
export const selectCartPartnerId = (s: { cart: CartState }) =>
  s.cart.items.length > 0 ? s.cart.items[0].partnerId : null;

export default cartSlice.reducer;

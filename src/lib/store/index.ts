import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import chargesReducer from "./chargesSlice";
import uiReducer from "./uiSlice";
import addressReducer from "./addressSlice";
import checkoutReducer from "./checkoutSlice";
import type { CartState } from "./cartSlice";
import type { ChargesState } from "./chargesSlice";

const rootReducer = combineReducers({
  cart: cartReducer,
  charges: chargesReducer,
  ui: uiReducer,
  addresses: addressReducer,
  checkout: checkoutReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

// LocalStorage persistence helpers (client-only)
const STORAGE_KEY = "reddi.cartState.v1";

type PersistedState = {
  cart?: CartState;
  charges?: ChargesState;
};

// loadState: moved to client-only hydration in ReduxProvider to avoid SSR mismatch

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota or serialization errors
  }
}

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== "production",
  });

  // Persist on changes (debounced)
  if (typeof window !== "undefined") {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    store.subscribe(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const s = store.getState() as RootState;
        const toPersist: PersistedState = {
          cart: s.cart,
          charges: s.charges,
        };
        saveState(toPersist);
      }, 200);
    });
  }

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

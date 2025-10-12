import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import chargesReducer from "./chargesSlice";
import uiReducer from "./uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      charges: chargesReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;

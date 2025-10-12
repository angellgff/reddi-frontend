import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  cartOpen: boolean;
}

const initialState: UIState = {
  cartOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart(state) {
      state.cartOpen = true;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
    toggleCart(state) {
      state.cartOpen = !state.cartOpen;
    },
  },
});

export const { openCart, closeCart, toggleCart } = uiSlice.actions;
export const selectCartOpen = (s: { ui: UIState }) => s.ui.cartOpen;
export default uiSlice.reducer;

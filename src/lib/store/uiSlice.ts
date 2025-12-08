import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  cartOpen: boolean;
  filtersOpen: boolean;
}

const initialState: UIState = {
  cartOpen: false,
  filtersOpen: false,
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
    openFilters(state) {
      state.filtersOpen = true;
    },
    closeFilters(state) {
      state.filtersOpen = false;
    },
    toggleFilters(state) {
      state.filtersOpen = !state.filtersOpen;
    },
  },
});

export const { openCart, closeCart, toggleCart, openFilters, closeFilters, toggleFilters } = uiSlice.actions;
export const selectCartOpen = (s: { ui: UIState }) => s.ui.cartOpen;
export const selectFiltersOpen = (s: { ui: UIState }) => s.ui.filtersOpen;
export default uiSlice.reducer;

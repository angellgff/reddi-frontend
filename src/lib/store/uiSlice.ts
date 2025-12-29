import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  cartOpen: boolean;
  filtersOpen: boolean;
  addressSliderOpen: boolean;
}

const initialState: UIState = {
  cartOpen: false,
  filtersOpen: false,
  addressSliderOpen: false,
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
    openAddressSlider(state) {
      state.addressSliderOpen = true;
    },
    closeAddressSlider(state) {
      state.addressSliderOpen = false;
    },
    toggleAddressSlider(state) {
      state.addressSliderOpen = !state.addressSliderOpen;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  openFilters,
  closeFilters,
  toggleFilters,
  openAddressSlider,
  closeAddressSlider,
  toggleAddressSlider,
} = uiSlice.actions;
export const selectCartOpen = (s: { ui: UIState }) => s.ui.cartOpen;
export const selectFiltersOpen = (s: { ui: UIState }) => s.ui.filtersOpen;
export const selectAddressSliderOpen = (s: { ui: UIState }) =>
  s.ui.addressSliderOpen;
export default uiSlice.reducer;

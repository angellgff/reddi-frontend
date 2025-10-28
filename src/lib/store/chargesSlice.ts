import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChargesState {
  shippingFee: number;
  serviceFee: number;
}

const initialState: ChargesState = {
  shippingFee: 0,
  serviceFee: 0,
};

const chargesSlice = createSlice({
  name: "charges",
  initialState,
  reducers: {
    setShippingFee(state, action: PayloadAction<number>) {
      state.shippingFee = Math.max(0, action.payload);
    },
    setServiceFee(state, action: PayloadAction<number>) {
      state.serviceFee = Math.max(0, action.payload);
    },
  },
});

export const { setShippingFee, setServiceFee } = chargesSlice.actions;

export const selectShippingFee = (s: { charges: ChargesState }) =>
  s.charges.shippingFee;
export const selectServiceFee = (s: { charges: ChargesState }) =>
  s.charges.serviceFee;

export default chargesSlice.reducer;

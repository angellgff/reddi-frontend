import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ShippingEstimate {
  cost: number;
  distanceMeters: number;
  durationSeconds: number;
  originCoordinates?: any;
  destinationCoordinates?: any;
  routeGeoJson?: any;
}

export interface ChargesState {
  shippingFee: number;
  serviceFee: number;
  shippingEstimate: ShippingEstimate | null;
}

const initialState: ChargesState = {
  shippingFee: 0,
  serviceFee: 0,
  shippingEstimate: null,
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
    setShippingEstimate(state, action: PayloadAction<ShippingEstimate | null>) {
      state.shippingEstimate = action.payload;
    },
  },
});

export const { setShippingFee, setServiceFee, setShippingEstimate } =
  chargesSlice.actions;

export const selectShippingFee = (s: { charges: ChargesState }) =>
  s.charges.shippingFee;
export const selectServiceFee = (s: { charges: ChargesState }) =>
  s.charges.serviceFee;
export const selectShippingEstimate = (s: { charges: ChargesState }) =>
  s.charges.shippingEstimate;

export default chargesSlice.reducer;

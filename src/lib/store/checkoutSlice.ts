import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ScheduleState =
  | { mode: "now" }
  | { mode: "later"; date: string; time: string };

export interface CheckoutState {
  addressId: string | null;
  placeType: string | null; // villa | yate (display only)
  placeNumber: string | null; // number text (display only)
  instructions: string;
  schedule: ScheduleState;
  coupon: string;
  discountPct: number;
  tipPercent: number; // 0,3,6,9,12,15
  payment: {
    brand: string | null;
    last4: string | null;
    cardholder_name: string | null;
  } | null;
}

const initialState: CheckoutState = {
  addressId: null,
  placeType: null,
  placeNumber: null,
  instructions: "",
  schedule: { mode: "now" },
  coupon: "",
  discountPct: 0,
  tipPercent: 9,
  payment: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setAddressId(state, action: PayloadAction<string | null>) {
      state.addressId = action.payload;
    },
    setPlace(
      state,
      action: PayloadAction<{ type: string | null; number: string | null }>
    ) {
      state.placeType = action.payload.type;
      state.placeNumber = action.payload.number;
    },
    setInstructions(state, action: PayloadAction<string>) {
      state.instructions = action.payload;
    },
    setSchedule(state, action: PayloadAction<ScheduleState>) {
      state.schedule = action.payload;
    },
    setCoupon(state, action: PayloadAction<{ code: string; pct: number }>) {
      state.coupon = action.payload.code;
      state.discountPct = action.payload.pct;
    },
    setTipPercent(state, action: PayloadAction<number>) {
      state.tipPercent = action.payload;
    },
    setPayment(state, action: PayloadAction<CheckoutState["payment"]>) {
      state.payment = action.payload;
    },
    resetCheckout() {
      return initialState;
    },
  },
});

export const {
  setAddressId,
  setPlace,
  setInstructions,
  setSchedule,
  setCoupon,
  setTipPercent,
  setPayment,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

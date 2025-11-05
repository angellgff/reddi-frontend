// src/lib/store/checkoutSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// NUEVO: Definir un tipo para el objeto del cupón validado.
// Este tipo debe coincidir con lo que devuelve tu Edge Function 'validate-coupon'.
export interface ValidatedCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
}

export type ScheduleState =
  | { mode: "now" }
  | { mode: "later"; date: string; time: string };

export interface CheckoutState {
  addressId: string | null;
  placeType: string | null;
  placeNumber: string | null;
  instructions: string;
  schedule: ScheduleState;
  // MODIFICADO: 'coupon' ahora es un objeto o null.
  coupon: ValidatedCoupon | null;
  tipPercent: number;
  payment: {
    brand: string | null;
    last4: string | null;
    cardholder_name: string | null;
  } | null;
  // NUEVO: estimación de envío calculada vía API
  shippingEstimate: {
    cost: number;
    distanceMeters: number;
    durationSeconds: number;
    originCoordinates: { longitude: number; latitude: number };
    destinationCoordinates: { longitude: number; latitude: number };
    routeGeoJson?: { type: "LineString"; coordinates: [number, number][] };
  } | null;
  // ELIMINADO: 'discountPct' es redundante, lo calcularemos desde el objeto 'coupon'.
}

const initialState: CheckoutState = {
  addressId: null,
  placeType: null,
  placeNumber: null,
  instructions: "",
  schedule: { mode: "now" },
  // MODIFICADO: El estado inicial para el cupón es null.
  coupon: null,
  tipPercent: 9,
  payment: null,
  shippingEstimate: null,
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
    // MODIFICADO: 'setCoupon' ahora acepta el objeto ValidatedCoupon o null.
    setCoupon(state, action: PayloadAction<ValidatedCoupon | null>) {
      state.coupon = action.payload;
    },
    setTipPercent(state, action: PayloadAction<number>) {
      state.tipPercent = action.payload;
    },
    setPayment(state, action: PayloadAction<CheckoutState["payment"]>) {
      state.payment = action.payload;
    },
    setShippingEstimate(
      state,
      action: PayloadAction<CheckoutState["shippingEstimate"]>
    ) {
      state.shippingEstimate = action.payload ?? null;
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
  setShippingEstimate,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore } from ".";
import { useAppDispatch } from "./hooks";
import { setCartItems, type CartItem } from "./cartSlice";
import { setServiceFee, setShippingFee } from "./chargesSlice";

const store = makeStore();

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <HydrateFromStorage>{children}</HydrateFromStorage>
    </Provider>
  );
}

function HydrateFromStorage({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("reddi.cartState.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cart?: { items: CartItem[] };
        charges?: { shippingFee: number; serviceFee: number };
      };
      if (parsed.cart?.items) dispatch(setCartItems(parsed.cart.items));
      if (parsed.charges) {
        if (typeof parsed.charges.shippingFee === "number")
          dispatch(setShippingFee(parsed.charges.shippingFee));
        if (typeof parsed.charges.serviceFee === "number")
          dispatch(setServiceFee(parsed.charges.serviceFee));
      }
    } catch {
      // ignore
    }
  }, [dispatch]);
  return <>{children}</>;
}

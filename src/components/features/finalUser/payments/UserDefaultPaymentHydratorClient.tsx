"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { setPayment as setPaymentGlobal } from "@/src/lib/store/checkoutSlice";
import type { UserPaymentMethod } from "@/src/lib/finalUser/payments/actions";

export default function UserDefaultPaymentHydratorClient({
  method,
}: {
  method: UserPaymentMethod | null;
}) {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.checkout.payment);

  useEffect(() => {
    if (!current && method) {
      // Store only fields used by checkout slice to keep it lean
      dispatch(
        setPaymentGlobal({
          brand: method.brand || null,
          last4: method.last4 || null,
          cardholder_name: method.cardholder_name || null,
        })
      );
    }
  }, [current, method, dispatch]);

  return null;
}

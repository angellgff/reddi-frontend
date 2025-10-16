"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import AddressStep from "@/src/components/features/finalUser/checkout/AddressStep";
import ScheduleStep from "@/src/components/features/finalUser/checkout/ScheduleStep";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { fetchUserAddresses } from "@/src/lib/store/addressSlice";
import {
  setAddressId,
  setInstructions,
  setSchedule,
} from "@/src/lib/store/checkoutSlice";

export default function CheckoutAddressPage() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.addresses);
  const checkout = useAppSelector((s) => s.checkout);

  useEffect(() => {
    if (status === "idle") dispatch(fetchUserAddresses());
  }, [status, dispatch]);

  const [addressId, setAddressLocal] = useState<string | null>(
    checkout.addressId
  );
  const [instructions, setInstructionsLocal] = useState<string>(
    checkout.instructions || ""
  );
  const [schedule, setScheduleLocal] = useState(checkout.schedule);

  useEffect(() => {
    dispatch(setAddressId(addressId ?? null));
  }, [addressId, dispatch]);
  useEffect(() => {
    dispatch(setInstructions(instructions));
  }, [instructions, dispatch]);
  useEffect(() => {
    dispatch(setSchedule(schedule));
  }, [schedule, dispatch]);

  const canProceed =
    addressId &&
    (schedule.mode === "now" ||
      ((schedule as any).date && (schedule as any).time));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Stepper current="direccion" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <section className="rounded-2xl border bg-white p-4">
            <div className="text-base font-semibold">Dirección de entrega</div>
            <div className="mt-3">
              <AddressStep value={addressId} onChange={setAddressLocal} />
              <div className="mt-3 grid gap-2">
                <label className="text-sm">
                  Instrucciones especiales para la entrega
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructionsLocal(e.target.value)}
                  placeholder="Ingresa la información"
                  className="min-h-[100px] rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-4">
            <div className="text-base font-semibold">
              Programación de entrega
            </div>
            <div className="mt-3">
              <ScheduleStep value={schedule} onChange={setScheduleLocal} />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <Link
                href="/user/checkout/payment"
                className="h-10 rounded-xl border px-4 text-sm"
              >
                Volver
              </Link>
              <Link
                href="/user/checkout/confirm"
                className={`h-10 rounded-xl px-4 text-sm text-white ${
                  canProceed
                    ? "bg-emerald-600"
                    : "bg-gray-300 pointer-events-none"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

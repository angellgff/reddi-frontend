"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { fetchUserAddresses } from "@/src/lib/store/addressSlice";

export default function AddressStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (addressId: string | null) => void;
}) {
  const dispatch = useAppDispatch();
  const { addresses, selectedAddressId, status, error } = useAppSelector(
    (s) => s.addresses
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchUserAddresses());
  }, [status, dispatch]);

  useEffect(() => {
    if (!value) {
      if (selectedAddressId) onChange(selectedAddressId);
      else if (addresses.length > 0)
        onChange(addresses[0].id as unknown as string);
    }
  }, [value, selectedAddressId, addresses, onChange]);

  const displayed = useMemo(() => {
    const id = value || selectedAddressId || null;
    const a = addresses.find((x) => (x.id as unknown as string) === id);
    if (!a) return "";
    return `${String(a.location_type).toUpperCase()} ${
      a.location_number
    }`.trim();
  }, [addresses, value, selectedAddressId]);

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">
            {status === "loading"
              ? "Cargando dirección…"
              : displayed || "Sin dirección seleccionada"}
          </div>
          {error ? (
            <div className="text-[11px] text-red-600">{error}</div>
          ) : null}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="h-8 rounded-lg border px-3 text-xs"
        >
          Cambiar
        </button>
      </div>
      {open && (
        <div className="mt-3 rounded-lg border bg-white shadow-sm overflow-hidden">
          {status === "loading" ? (
            <div className="px-3 py-2 text-xs text-gray-500">
              Cargando direcciones…
            </div>
          ) : addresses.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">
              No tienes direcciones guardadas.
            </div>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {addresses.map((a) => {
                const id = a.id as unknown as string;
                const label = `${String(a.location_type).toUpperCase()} ${
                  a.location_number
                }`.trim();
                const selected = id === value;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                        selected ? "bg-emerald-50 text-emerald-700" : ""
                      }`}
                    >
                      <span>{label}</span>
                      {selected ? (
                        <span className="text-xs">Seleccionada</span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Seleccionar
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

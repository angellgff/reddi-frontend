"use client";

import { Fragment, useMemo, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Seleccione" },
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "En preparación" },
  { value: "out_for_delivery", label: "En camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "", label: "Seleccione" },
  { value: "market", label: "Mercado" },
  { value: "restaurant", label: "Restaurante" },
  { value: "liquor_store", label: "Licorería" },
] as const;

export default function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // hydrate from URL
  useEffect(() => {
    setSearch(sp.get("q") || "");
    setFrom(sp.get("from") || "");
    setTo(sp.get("to") || "");
    setStatus(sp.get("status") || "");
    setCategory(sp.get("category") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (status) params.set("status", status);
        if (category) params.set("category", category);
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      }}
    >
      {/* row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* search */}
        <div className="lg:col-span-6">
          <label className="block text-sm font-medium text-[#292929] mb-1">
            Buscar
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-[#D9DCE3] px-4 h-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.65 16.65M18 10.5C18 14.0899 15.0899 17 11.5 17C7.91015 17 5 14.0899 5 10.5C5 6.91015 7.91015 4 11.5 4C15.0899 4 18 6.91015 18 10.5Z"
                stroke="#9BA1AE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              className="w-full outline-none text-[16px] placeholder:text-[#292929]/50"
              placeholder="Buscar por ID, cliente, aliado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* date from */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-[#292929] mb-1">
            Desde
          </label>
          <input
            type="date"
            className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-[16px]"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        {/* date to */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-[#292929] mb-1">
            Hasta
          </label>
          <input
            type="date"
            className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-[16px]"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {/* row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
        <div className="lg:col-span-6">
          <label className="block text-sm font-medium text-[#292929] mb-1">
            Estados
          </label>
          <Listbox value={status} onChange={setStatus}>
            <div className="relative">
              <Listbox.Button className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-left text-[16px] text-[#292929]/70">
                {STATUS_OPTIONS.find((o) => o.value === status)?.label ||
                  "Seleccione"}
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {STATUS_OPTIONS.map((opt) => (
                    <Listbox.Option
                      key={opt.value}
                      value={opt.value}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 text-sm ${
                          active ? "bg-gray-100" : ""
                        }`
                      }
                    >
                      {opt.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        <div className="lg:col-span-6">
          <label className="block text-sm font-medium text-[#292929] mb-1">
            Categorías
          </label>
          <Listbox value={category} onChange={setCategory}>
            <div className="relative">
              <Listbox.Button className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-left text-[16px] text-[#292929]/70">
                {CATEGORY_OPTIONS.find((o) => o.value === category)?.label ||
                  "Seleccione"}
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <Listbox.Option
                      key={opt.value}
                      value={opt.value}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 text-sm ${
                          active ? "bg-gray-100" : ""
                        }`
                      }
                    >
                      {opt.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="h-11 rounded-xl border border-[#202124] bg-white px-5 text-sm font-medium text-[#202124]"
          onClick={() => {
            setSearch("");
            setFrom("");
            setTo("");
            setStatus("");
            setCategory("");
            router.push(pathname);
          }}
        >
          Limpiar filtros
        </button>
        <button
          className="h-11 rounded-xl bg-[#04BD88] px-5 text-sm font-medium text-white"
          type="submit"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
}

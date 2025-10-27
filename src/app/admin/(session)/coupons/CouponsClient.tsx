"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CouponRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  start_date: string; // ISO
  end_date: string; // ISO
  status: "active" | "inactive" | "expired";
};

function formatDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("es-DO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function StatusBadge({ status }: { status: CouponRow["status"] }) {
  const { text, cls } = useMemo(() => {
    switch (status) {
      case "active":
        return { text: "Activo", cls: "bg-[#D7FFD8] text-[#04910C]" };
      case "inactive":
        return { text: "Inactivo", cls: "bg-[#FFDCDC] text-[#FF0000]" };
      case "expired":
        return { text: "Vencido", cls: "bg-[#F2F4F7] text-[#667085]" };
      default:
        return { text: String(status), cls: "bg-gray-100 text-gray-600" };
    }
  }, [status]);
  return (
    <span
      className={`inline-flex rounded-[10px] px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      {text}
    </span>
  );
}

export default function CouponsClient({ coupons }: { coupons: CouponRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");

  const filtered = useMemo(() => {
    let list = coupons;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.code.toLowerCase().includes(q) ||
          x.title.toLowerCase().includes(q) ||
          (x.description ?? "").toLowerCase().includes(q)
      );
    }
    if (status) {
      list = list.filter((x) => x.status === status);
    }
    return list;
  }, [query, status, coupons]);

  return (
    <div className="bg-[#F0F2F5B8] p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#171717]">Cupones</h1>
        <Link
          href="/admin/coupons/create"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#04BD88] px-5 text-sm font-medium text-white hover:opacity-95"
        >
          Crear Cupón
        </Link>
      </div>

      {/* Filtros */}
      <section className="mb-6 rounded-2xl bg-white p-5">
        <div className="mb-4 text-[18px] font-semibold text-[#1F2937]">
          Filtros
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Buscar */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-[#292929]">
              Buscar
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[#D9DCE3] px-4 py-2">
              <input
                placeholder="Buscar por Código"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 outline-none placeholder:text-[#292929]/50"
              />
            </div>
          </div>
          {/* Estado */}
          <div className="w-full md:w-72">
            <label className="mb-2 block text-sm font-medium text-[#292929]">
              Estados
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-[#D9DCE3] px-4 py-2 text-sm text-[#292929]"
            >
              <option value="">Seleccione</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="expired">Vencido</option>
            </select>
          </div>
          <div className="flex w-full justify-end gap-3 md:w-auto">
            <button
              onClick={() => {
                setQuery("");
                setStatus("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-black px-5 text-sm font-medium text-[#202124] bg-white"
            >
              Limpiar filtros
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#04BD88] px-5 text-sm font-medium text-white">
              Filtrar
            </button>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between text-[#1F2937]">
          <div className="text-[18px] font-semibold">Lista de cupones</div>
          <div className="text-sm text-[#6A6C71]">
            {filtered.length} resultados
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D9DCE3]">
          {/* Header */}
          <div className="grid grid-cols-12 bg-[#F0F2F5B8] text-[#525252]">
            <div className="col-span-2 px-3 py-3 text-sm font-medium">
              Código
            </div>
            <div className="col-span-2 px-3 py-3 text-sm font-medium">
              Título
            </div>
            <div className="col-span-4 px-3 py-3 text-sm font-medium">
              Descripción
            </div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">
              Inicio
            </div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">
              Final
            </div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">
              Estado
            </div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">
              Acciones
            </div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-[#E7E7E7]">
            {filtered.map((c) => (
              <div key={c.id} className="grid grid-cols-12 bg-white">
                <div className="col-span-2 px-3 py-3 text-sm text-[#454545]">
                  {c.code}
                </div>
                <div className="col-span-2 px-3 py-3 text-sm text-[#454545]">
                  {c.title}
                </div>
                <div className="col-span-4 px-3 py-3 text-sm text-[#454545]">
                  {c.description}
                </div>
                <div className="col-span-1 px-3 py-3 text-sm text-[#171717]">
                  {formatDate(c.start_date)}
                </div>
                <div className="col-span-1 px-3 py-3 text-sm text-[#171717]">
                  {formatDate(c.end_date)}
                </div>
                <div className="col-span-1 px-3 py-3">
                  <StatusBadge status={c.status} />
                </div>
                <div className="col-span-1 px-3 py-3">
                  <div className="flex items-center gap-3 text-[#6A6C71]">
                    <button title="Editar" className="hover:text-black">
                      ✎
                    </button>
                    <button title="Eliminar" className="hover:text-black">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginación (placeholder) */}
        <div className="mt-4 flex items-center justify-between text-sm text-[#737373]">
          <div>
            <span className="text-[#1A71F6] font-bold">1</span> -{" "}
            {filtered.length} of {filtered.length} Pages
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#454545]">The page on</span>
            <div className="rounded-md border border-[#B0B0B0] px-2 py-1">
              1 ▾
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-[#B0B0B0] px-2 py-1">
                ◀
              </button>
              <button className="rounded-md border border-[#B0B0B0] px-2 py-1">
                ▶
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { deletePricingRule } from "@/src/lib/actions/admin/pricing-rules";
import { Loader2, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";

export type PricingRuleRow = {
  id: string;
  name: string;
  base_fee: number;
  fee_per_kilometer: number;
  min_fee: number | null;
  max_fee: number | null;
  is_active: boolean;
  created_at: string;
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex rounded-[10px] px-2.5 py-1 text-xs font-medium bg-[#D7FFD8] text-[#04910C]">
        Activo
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-[10px] px-2.5 py-1 text-xs font-medium bg-[#FFDCDC] text-[#FF0000]">
      Inactivo
    </span>
  );
}

export default function PricingRulesClient({ rules }: { rules: PricingRuleRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(""); // "true" | "false" | ""
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let list = rules;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((x) => x.name.toLowerCase().includes(q));
    }
    if (status !== "") {
      const isActive = status === "true";
      list = list.filter((x) => x.is_active === isActive);
    }
    return list;
  }, [query, status, rules]);

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta regla?")) return;
    
    startTransition(async () => {
      const res = await deletePricingRule(id);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Regla eliminada");
      }
    });
  };

  return (
    <div className="bg-[#F0F2F5B8] p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#171717]">Reglas de Precio</h1>
        <Link
          href="/admin/pricing-rules/create"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#04BD88] px-5 text-sm font-medium text-white hover:opacity-95 gap-2"
        >
          <Plus size={20} />
          Crear Regla
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
              <Search size={18} className="text-[#292929]/50" />
              <input
                placeholder="Buscar por Nombre"
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
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div className="flex w-full justify-end gap-3 md:w-auto">
            <button
              onClick={() => {
                setQuery("");
                setStatus("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-black px-5 text-sm font-medium text-[#202124] bg-white hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="rounded-2xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between text-[#1F2937]">
          <div className="text-[18px] font-semibold">Reglas ({filtered.length})</div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D9DCE3] overflow-x-auto">
          {/* Header */}
          <div className="grid min-w-[800px] grid-cols-12 bg-[#F0F2F5B8] text-[#525252]">
            <div className="col-span-3 px-3 py-3 text-sm font-medium">Nombre</div>
            <div className="col-span-2 px-3 py-3 text-sm font-medium">Tarifa Base</div>
            <div className="col-span-2 px-3 py-3 text-sm font-medium">Tarifa / km</div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">Mínima</div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">Máxima</div>
            <div className="col-span-2 px-3 py-3 text-sm font-medium">Estado</div>
            <div className="col-span-1 px-3 py-3 text-sm font-medium">Acciones</div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-[#E7E7E7] min-w-[800px]">
            {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No hay resultados.</div>
            ) : filtered.map((c) => (
              <div key={c.id} className="grid grid-cols-12 bg-white items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-3 px-3 py-3 text-sm text-[#171717] font-medium">
                  {c.name}
                </div>
                <div className="col-span-2 px-3 py-3 text-sm text-[#454545]">
                  {formatCurrency(c.base_fee)}
                </div>
                <div className="col-span-2 px-3 py-3 text-sm text-[#454545]">
                  {formatCurrency(c.fee_per_kilometer)}
                </div>
                <div className="col-span-1 px-3 py-3 text-sm text-[#454545]">
                  {c.min_fee ? formatCurrency(c.min_fee) : "-"}
                </div>
                <div className="col-span-1 px-3 py-3 text-sm text-[#454545]">
                  {c.max_fee ? formatCurrency(c.max_fee) : "-"}
                </div>
                <div className="col-span-2 px-3 py-3">
                  <StatusBadge isActive={c.is_active} />
                </div>
                <div className="col-span-1 px-3 py-3">
                  <div className="flex items-center gap-3 text-[#6A6C71]">
                    <Link href={`/admin/pricing-rules/${c.id}/edit`} title="Editar" className="hover:text-black transition-colors">
                      <Edit2 size={18} />
                    </Link>
                    <button 
                        title="Eliminar" 
                        className="hover:text-red-600 transition-colors disabled:opacity-50"
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending}
                    >
                      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

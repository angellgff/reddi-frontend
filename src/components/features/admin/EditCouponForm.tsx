"use client";

import Link from "next/link";
import { updateCoupon } from "@/src/lib/admin/actions/coupons";
import type { Database } from "@/src/lib/database.types";

// Reusing types from create page or DB
type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export default function EditCouponForm({ coupon }: { coupon: Coupon }) {
  // Format dates for input type="date"
  // coupon.start_date is ISO string, we need YYYY-MM-DD
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F2F5B8]">
      {/* Content */}
      <div className="mx-auto  px-[50px] py-[30px]">
        {/* Titles */}
        <div className="mb-7">
          <h2 className="text-[24px] font-semibold leading-[28px] text-[#171717]">
            Editar cupón
          </h2>
          <p className="mt-1 text-[14px] font-medium leading-[18px] text-[#292929]">
            Editar configuración del cupón
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] bg-white p-5">
          <div className="rounded-[16px] border border-[#D9DCE3] p-5">
            <div className="mb-4 text-[20px] font-semibold leading-6 text-[#04BD88]">
              Información del Cupón
            </div>

            <form action={updateCoupon} className="space-y-4">
              <input type="hidden" name="id" value={coupon.id} />

              {/* Código + Estado */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Código visible para usuarios
                  </label>
                  <input
                    name="code"
                    required
                    defaultValue={coupon.code}
                    placeholder="Ingresar la información"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Estado
                  </label>
                  <select
                    name="status"
                    defaultValue={coupon.status}
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  >
                    <option value="">Seleccione</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="expired">Vencido</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#292929]">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={coupon.description || ""}
                  placeholder="Ingresa la información"
                  className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                />
              </div>

              {/* Tipo de descuento + Compra mínima */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tipo de descuento
                  </label>
                  <select
                    name="discount_type"
                    defaultValue={coupon.discount_type}
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  >
                    <option value="">Seleccione</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed_amount">Monto fijo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Compra mínima ($)
                  </label>
                  <input
                    name="minimum_purchase_amount"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={coupon.minimum_purchase_amount}
                    placeholder="Ingresar la información"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
              </div>

              {/* Título + Valor descuento */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Título
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={coupon.title}
                    placeholder="Ingresar la información"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Valor del descuento
                  </label>
                  <input
                    name="discount_value"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={coupon.discount_value}
                    placeholder="Ingresar la información"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
              </div>

              {/* Vigencia */}
              <div>
                <label className="mb-2 block text-[16px] font-medium text-[#292929]">
                  Vigencia
                </label>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#292929]">
                      Desde
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={formatDateForInput(coupon.start_date)}
                      className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#292929]">
                      Hasta
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      defaultValue={formatDateForInput(coupon.end_date)}
                      className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/admin/coupons"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#202124] bg-white px-5 text-sm font-medium text-[#202124]"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#04BD88] px-5 text-sm font-medium text-white"
                >
                  Guardar cambios →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

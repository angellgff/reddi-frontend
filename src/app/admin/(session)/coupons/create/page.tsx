import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type CouponStatus = "active" | "inactive" | "expired";
type DiscountType = "percentage" | "fixed_amount";

async function createCoupon(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const code = (formData.get("code") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as CouponStatus) || "inactive";
  const discount_type =
    (formData.get("discount_type") as DiscountType) || "percentage";
  const discount_value = Number(formData.get("discount_value") || 0);
  const minimum_purchase_amount = Number(
    formData.get("minimum_purchase_amount") || 0
  );
  const start_date_raw = formData.get("start_date") as string; // yyyy-mm-dd
  const end_date_raw = formData.get("end_date") as string; // yyyy-mm-dd

  const start_date = start_date_raw
    ? new Date(start_date_raw + "T00:00:00Z").toISOString()
    : new Date().toISOString();
  const end_date = end_date_raw
    ? new Date(end_date_raw + "T23:59:59Z").toISOString()
    : new Date().toISOString();

  if (!code || !title) {
    // Basic guard; in a larger app, return formState with error
    return;
  }

  const { error } = await supabase.from("coupons").insert({
    code,
    title,
    description,
    status,
    discount_type,
    discount_value,
    minimum_purchase_amount,
    start_date,
    end_date,
    // created_by left null for now; can be filled by joining admins on auth user
  });

  if (error) {
    console.error("create coupon error", error);
    // On error, do nothing special; you could surface a toast via redirect search param
  }

  redirect("/admin/coupons");
}

export default async function CreateCouponPage() {
  return (
    <div className="min-h-screen w-full bg-[#F0F2F5B8]">
      {/* Content */}
      <div className="mx-auto  px-[50px] py-[30px]">
        {/* Titles */}
        <div className="mb-7">
          <h2 className="text-[24px] font-semibold leading-[28px] text-[#171717]">
            Crear cupón
          </h2>
          <p className="mt-1 text-[14px] font-medium leading-[18px] text-[#292929]">
            Configurar cupón global
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] bg-white p-5">
          <div className="rounded-[16px] border border-[#D9DCE3] p-5">
            <div className="mb-4 text-[20px] font-semibold leading-6 text-[#04BD88]">
              Información del Cupón
            </div>

            <form action={createCoupon} className="space-y-4">
              {/* Código + Estado */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Código visible para usuarios
                  </label>
                  <input
                    name="code"
                    required
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
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                    defaultValue="inactive"
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
                  Activar ahora →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

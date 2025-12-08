import { createPricingRule } from "@/src/lib/actions/admin/pricing-rules";
import Link from "next/link";

export default function CreatePricingRulePage() {
  return (
    <div className="min-h-screen w-full bg-[#F0F2F5B8]">
      {/* Content */}
      <div className="mx-auto  px-[50px] py-[30px] max-w-5xl">
        {/* Titles */}
        <div className="mb-7">
          <h2 className="text-[24px] font-semibold leading-[28px] text-[#171717]">
            Crear Regla de Precio
          </h2>
          <p className="mt-1 text-[14px] font-medium leading-[18px] text-[#292929]">
            Configurar nueva regla de entrega
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] bg-white p-5">
          <div className="rounded-[16px] border border-[#D9DCE3] p-5">
            <div className="mb-4 text-[20px] font-semibold leading-6 text-[#04BD88]">
              Información de la Regla
            </div>

            <form action={createPricingRule} className="space-y-6">
              {/* Nombre + Estado */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Nombre de la regla
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Ej. Tarifa estándar, Zona Norte, Nocturna"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Estado
                  </label>
                  <select
                    name="is_active"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                    defaultValue="true"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Tarifas Base */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                   <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Base ($)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Costo inicial del envío sin considerar distancia.</p>
                  <input
                    name="base_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa por Kilómetro ($)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Se suma esta cantidad por cada km de distancia.</p>
                  <input
                    name="fee_per_kilometer"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
              </div>

               {/* Límites */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Mínima ($) (Opcional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">El costo nunca será menor a este valor.</p>
                  <input
                    name="min_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Máxima ($) (Opcional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">El costo nunca excederá este valor.</p>
                  <input
                    name="max_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929] placeholder:text-[#292929]/50"
                  />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <Link
                  href="/admin/pricing-rules"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#202124] bg-white px-5 text-sm font-medium text-[#202124] hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#04BD88] px-8 text-sm font-medium text-white hover:bg-[#03a072]"
                >
                  Crear Regla
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

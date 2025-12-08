import { updatePricingRule } from "@/src/lib/actions/admin/pricing-rules";
import { createClient } from "@/src/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface EditPricingRulePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricingRulePage({ params }: EditPricingRulePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: rule, error } = await supabase
    .from("delivery_pricing_rules")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !rule) {
    redirect("/admin/pricing-rules");
  }

  // Bind the ID to the update action
  const updateAction = updatePricingRule.bind(null, id);

  return (
    <div className="min-h-screen w-full bg-[#F0F2F5B8]">
      <div className="mx-auto px-[50px] py-[30px] max-w-5xl">
        <div className="mb-7">
          <h2 className="text-[24px] font-semibold leading-[28px] text-[#171717]">
            Editar Regla de Precio
          </h2>
          <p className="mt-1 text-[14px] font-medium leading-[18px] text-[#292929]">
            Modificar regla existente
          </p>
        </div>

        <div className="rounded-[20px] bg-white p-5">
          <div className="rounded-[16px] border border-[#D9DCE3] p-5">
            <div className="mb-4 text-[20px] font-semibold leading-6 text-[#04BD88]">
              Información de la Regla
            </div>

            <form action={updateAction} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Nombre de la regla
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={rule.name}
                    placeholder="Ej. Tarifa estándar"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Estado
                  </label>
                  <select
                    name="is_active"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                    defaultValue={rule.is_active ? "true" : "false"}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                   <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Base ($)
                  </label>
                  <input
                    name="base_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    defaultValue={rule.base_fee}
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa por Kilómetro ($)
                  </label>
                  <input
                    name="fee_per_kilometer"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    defaultValue={rule.fee_per_kilometer}
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  />
                </div>
              </div>

               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Mínima ($)
                  </label>
                  <input
                    name="min_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    // If null, defaultValue handles it, or empty string logic might be needed if react complains, 
                    // but standard input handles defaultvalue={null|number} okay usually, or use string?
                    defaultValue={rule.min_fee ?? ""}
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#292929]">
                    Tarifa Máxima ($)
                  </label>
                  <input
                    name="max_fee"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={rule.max_fee ?? ""}
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-[#D9DCE3] bg-white px-4 py-2.5 text-[#292929]"
                  />
                </div>
              </div>

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
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

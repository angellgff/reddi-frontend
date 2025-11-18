"use server";

import { getDriverProfile } from "@/src/lib/admin/data/drivers/getDriverProfile";
import Link from "next/link";

export default async function AdminDriverProfilePage({ params }: any) {
  const { id } = params;
  const driver = await getDriverProfile(id);

  const fullName =
    [driver?.first_name, driver?.last_name].filter(Boolean).join(" ") || "-";

  return (
    <div className="bg-[#F0F2F5B8] min-h-screen">
      {/* Navbar */}
      <div className="bg-white border-b-2 border-[#E7E7E7] px-8 py-6">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="hidden w-9 h-9 rounded-lg bg-[#F6F6F6]" />
            <div className="w-9 h-9 rounded-lg bg-[#F6F6F6]" />
            <div className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="px-12 py-8">
        <h1 className="text-2xl font-semibold text-[#171717] mb-6">
          Perfil del {fullName}
        </h1>

        <section className="bg-white rounded-2xl p-6 space-y-5 border border-[#D9DCE3]">
          <h2 className="text-[#04BD88] text-xl font-semibold">
            Datos personales
          </h2>
          <div className="flex items-start gap-6">
            <div className="w-[108px] h-[108px] rounded-full bg-gray-200" />
            <div className="flex flex-col gap-3">
              <button className="px-3 py-2 rounded-xl border border-[#202124] text-[#202124] w-22 h-9 text-sm">
                Subir foto
              </button>
              <div className="text-[#04BD88] font-bold text-sm">
                Arrastra y suelta tu archivo aquí
              </div>
              <div className="text-[#767676] text-sm hidden">
                Formatos soportados: JPG, PNG
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-[#292929] font-medium mb-2">
                Nombre completo
              </label>
              <input
                className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm"
                defaultValue={fullName}
              />
            </div>
            <div>
              <label className="block text-sm text-[#292929] font-medium mb-2">
                Correo electrónico
              </label>
              <input
                className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm"
                defaultValue={driver?.email ?? ""}
              />
            </div>
            <div>
              <label className="block text-sm text-[#292929] font-medium mb-2">
                Teléfono
              </label>
              <input
                className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm"
                defaultValue={driver?.phone_number ?? ""}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-[#171717]">Estado del perfil</p>
            <div className="w-10 h-6 bg-[#525252] rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-5" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 mt-6 space-y-5 border border-[#D9DCE3]">
          <h2 className="text-[#04BD88] text-xl font-semibold">Documentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Documento de identidad" },
              { label: "Licencia de conducción" },
              { label: "Antecedentes" },
            ].map((d) => (
              <div key={d.label} className="space-y-2">
                <label className="block text-sm text-[#292929] font-medium">
                  {d.label}
                </label>
                <div className="border border-dashed border-[#D0D5DD] rounded-lg p-6 text-center">
                  <div className="text-[#04BD88] font-bold text-sm">
                    Arrastra y suelta tu archivo aquí
                  </div>
                  <div className="text-[#767676] text-sm">
                    o haz clic para seleccionar un archivo
                  </div>
                  <button className="mt-2 px-4 py-2 rounded-xl border border-[#202124] text-[#202124] text-sm">
                    Seleccionar Archivo
                  </button>
                  <div className="mt-2 text-[#5D5D5D] text-sm">
                    Formatos soportados: PDF, JPG, PNG, DOCX (máx. 10MB)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between mt-6">
          <Link
            href="/admin/drivers"
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[#101828] text-[#202124]"
          >
            Volver
          </Link>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 rounded-xl border border-[#202124] bg-white text-[#202124]">
              Cancelar
            </button>
            <button className="px-5 py-2 rounded-xl bg-[#04BD88] text-white">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

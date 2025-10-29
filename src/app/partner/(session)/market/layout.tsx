import PartnerAside, {
  NavLink,
} from "@/src/components/basics/dashboard/DashboardAside";
import PartnerHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedPartnerProfile } from "@/src/lib/partner/header/data/getData";
import { createClient } from "@/src/lib/supabase/server";
import { LogoutButton } from "@/src/components/logout-button";

const actualURL = "/partner";

const navigationLinks: NavLink[] = [
  {
    name: "Dashboard",
    href: `${actualURL}/dashboard`,
  },
  {
    name: "Inventario",
    href: `${actualURL}/productos`,
    subLinks: [
      { name: "Productos", href: `${actualURL}/productos` },
      { name: "Menú", href: `${actualURL}/menu` },
    ],
  },
  {
    name: "Usuarios",
    href: "#",

    subLinks: [
      { name: "Clientes", href: `${actualURL}/clientes` },
      { name: "Aliados", href: `${actualURL}/aliados` },
      { name: "Repartidores", href: `${actualURL}/repartidores` },
    ],
  },
  {
    name: "Banner",
    href: `${actualURL}/banner`,
  },
  {
    name: "Finanzas",
    href: `${actualURL}/finanzas`,
  },
];

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partnerProfile = await getAuthenticatedPartnerProfile();

  // Consultar estado de aprobación del aliado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isApproved = true;
  if (user) {
    const { data: partnerRow } = await supabase
      .from("partners")
      .select("is_approved")
      .eq("user_id", user.id)
      .single();
    isApproved = !!partnerRow?.is_approved;
  }
  return (
    <>
      <PartnerAside navigationLinks={navigationLinks} />
      <PartnerHeader profile={partnerProfile} />
      <main className="md:ml-[14rem] mt-[86px] bg-[#F0F2F5B8]">{children}</main>

      {/* Modal bloqueante si el aliado no está aprobado */}
      {!isApproved && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-xl font-semibold mb-2">Cuenta en revisión</h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta de aliado aún no ha sido aprobada por nuestro equipo.
              Mientras tanto, no podrás usar el panel de aliado.
            </p>
            <div className="flex items-center justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

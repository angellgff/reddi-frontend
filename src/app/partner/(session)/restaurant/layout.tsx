import PartnerAside from "@/src/components/basics/dashboard/DashboardAside";
import { NavLink } from "@/src/components/basics/dashboard/types";
import PartnerHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedPartnerProfile } from "@/src/lib/partner/header/data/getData";
import { createClient } from "@/src/lib/supabase/server";
import { LogoutButton } from "@/src/components/logout-button";

// Base de rutas correcta para la sección Restaurant
const actualURL = "/partner/restaurant";

const navigationLinks: NavLink[] = [
  {
    name: "Dashboard",
    href: `${actualURL}/dashboard`,
    icon: "dashboard", // Usaremos un string
  },
  {
    name: "Pedidos",
    href: `${actualURL}/orders`,
    icon: "order", // ANTES: OrderIcon
  },
  {
    name: "Productos",
    href: `${actualURL}/menu`,
    icon: "product", // ANTES: ProductIcon
  },
  {
    name: "Historial",
    href: `${actualURL}/history`,
    icon: "history", // ANTES: HistoryIcon
  },
  {
    name: "Soporte",
    href: `${actualURL}/support`,
    icon: "support", // ANTES: SupportIcon
  },
  {
    name: "Finanzas",
    href: `${actualURL}/finances`,
    icon: "finances", // ANTES: FinancesIcon
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
  let isActive = true;
  if (user) {
    const { data: partnerRow } = await supabase
      .from("partners")
      .select("is_approved, is_active")
      .eq("user_id", user.id)
      .single();
    isApproved = !!partnerRow?.is_approved;
    isActive = partnerRow?.is_active ?? true;
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

      {/* Modal bloqueante si el aliado no está activo (soft delete) */}
      {isApproved && !isActive && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-xl font-semibold mb-2">Cuenta desactivada</h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta de aliado ha sido desactivada o eliminada. Si crees que
              esto es un error, contacta con soporte.
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

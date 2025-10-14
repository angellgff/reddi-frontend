import PartnerAside, {
  NavLink,
} from "@/src/components/basics/dashboard/DashboardAside";
import PartnerHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedPartnerProfile } from "@/src/lib/partner/header/data/getData";
import { createClient } from "@/src/lib/supabase/server";
import { LogoutButton } from "@/src/components/logout-button";
import OrderIcon from "@/src/components/icons/OrderIcon";
import ProductIcon from "@/src/components/icons/ProductIcon";
import HistoryIcon from "@/src/components/icons/HistoryIcon";
import SupportIcon from "@/src/components/icons/SupportIcon";
import FinancesIcon from "@/src/components/icons/FinancesIcon";

const actualURL = "/aliado";

const navigationLinks: NavLink[] = [
  {
    name: "Dashboard",
    href: `${actualURL}/dashboard`,
  },
  {
    name: "Pedidos",
    href: `${actualURL}/pedidos`,
    icon: <OrderIcon className="h-5 w-5" />,
  },
  {
    name: "Productos",
    href: `${actualURL}/menu`,
    icon: <ProductIcon className="h-5 w-5" fill="#6A6C71" />,
  },
  {
    name: "Historial",
    href: "#",
    icon: <HistoryIcon className="h-5 w-5" fill="#6A6C71" />,
  },
  {
    name: "Soporte",
    href: `${actualURL}/support`,
    icon: <SupportIcon className="h-5 w-5" fill="#6A6C71" />,
  },
  {
    name: "Finanzas",
    href: `${actualURL}/finances`,
    icon: <FinancesIcon className="h-5 w-5" fill="#6A6C71" />,
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

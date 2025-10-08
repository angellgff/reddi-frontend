import PartnerAside, {
  NavLink,
} from "@/src/components/basics/dashboard/DashboardAside";
import PartnerHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedPartnerProfile } from "@/src/lib/partner/header/data/getData";

const actualURL = "/aliado";

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
  return (
    <>
      <PartnerAside navigationLinks={navigationLinks} />
      <PartnerHeader profile={partnerProfile} />
      <main className="md:ml-[14rem] mt-[86px] bg-[#F0F2F5B8]">{children}</main>
    </>
  );
}

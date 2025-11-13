import AdminAside, {
  NavLink,
} from "@/src/components/basics/dashboard/DashboardAside";
import AdminHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedAdminProfile } from "@/src/lib/admin/header/data/getData";

const actualURL = "/admin";

const navigationLinks: NavLink[] = [
  {
    name: "Dashboard",
    href: `${actualURL}/dashboard`,
  },
  {
    name: "Pedidos",
    href: `${actualURL}/orders`,
  },
  {
    name: "Cupones",
    href: `${actualURL}/coupons`,
  },
  {
    name: "Usuarios",
    href: "#",
    subLinks: [
      { name: "Clientes", href: `${actualURL}/customers` },
      { name: "Aliados", href: `${actualURL}/aliados` },
      { name: "Repartidores", href: `${actualURL}/drivers` },
    ],
  },
  {
    name: "Banner",
    href: `${actualURL}/banner`,
  },
  {
    name: "Finanzas",
    href: `${actualURL}/finances`,
  },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminProfile = await getAuthenticatedAdminProfile();
  return (
    <>
      <AdminAside navigationLinks={navigationLinks} />
      <AdminHeader profile={adminProfile} />
      <main className="md:ml-[14rem] mt-[86px] bg-[#F0F2F5B8]">{children}</main>
    </>
  );
}

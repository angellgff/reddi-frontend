import AdminAside from "@/src/components/basics/dashboard/DashboardAside";
import { NavLink } from "@/src/components/basics/dashboard/types";
import AdminHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedAdminProfile } from "@/src/lib/admin/header/data/getData";

const actualURL = "/admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminProfile = await getAuthenticatedAdminProfile();

  // ✅ CORRECCIÓN: Usar strings para los iconos para evitar problemas de serialización
  const navigationLinks: NavLink[] = [
    {
      name: "Dashboard",
      href: `${actualURL}/dashboard`,
      icon: "dashboard",
    },
    {
      name: "Pedidos",
      href: `${actualURL}/orders`,
      icon: "orders",
    },
    {
      name: "Cupones",
      href: `${actualURL}/coupons`,
      icon: "coupons",
    },
    {
      name: "Usuarios",
      href: "#",
      icon: "users",
      subLinks: [
        { name: "Clientes", href: `${actualURL}/customers` },
        { name: "Aliados", href: `${actualURL}/aliados` },
        { name: "Repartidores", href: `${actualURL}/drivers` },
      ],
    },
    {
      name: "Banner",
      href: `${actualURL}/banner`,
      icon: "banner",
    },
    {
      name: "Finanzas",
      href: `${actualURL}/finances`,
      icon: "adminFinances",
    },
  ];

  return (
    <>
      <AdminAside navigationLinks={navigationLinks} />
      <AdminHeader profile={adminProfile} />
      <main className="md:ml-[14rem] mt-[86px] bg-[#F0F2F5B8]">{children}</main>
    </>
  );
}

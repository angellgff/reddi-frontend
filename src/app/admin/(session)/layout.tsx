import AdminAside, {
  NavLink,
} from "@/src/components/basics/dashboard/DashboardAside";
import AdminHeader from "@/src/components/basics/dashboard/DashboardHeader";
import { getAuthenticatedAdminProfile } from "@/src/lib/admin/header/data/getData";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";
import AdminOrdersIcon from "@/src/components/icons/AdminOrdersIcon";
import AdminCouponIcon from "@/src/components/icons/AdminCouponIcon";
import AdminUsersIcon from "@/src/components/icons/AdminUsersIcon";
import AdminBannerIcon from "@/src/components/icons/AdminBannerIcon";
import AdminFinancesIcon from "@/src/components/icons/AdminFinancesIcon";

const actualURL = "/admin";

const navigationLinks: NavLink[] = [
  {
    name: "Dashboard",
    href: `${actualURL}/dashboard`,
    icon: <Squares2X2Icon />,
  },
  {
    name: "Pedidos",
    href: `${actualURL}/orders`,
    icon: <AdminOrdersIcon />,
  },
  {
    name: "Cupones",
    href: `${actualURL}/coupons`,
    icon: <AdminCouponIcon />,
  },
  {
    name: "Usuarios",
    href: "#",
    icon: <AdminUsersIcon />,
    subLinks: [
      { name: "Clientes", href: `${actualURL}/customers` },
      { name: "Aliados", href: `${actualURL}/aliados` },
      { name: "Repartidores", href: `${actualURL}/drivers` },
    ],
  },
  {
    name: "Banner",
    href: `${actualURL}/banner`,
    icon: <AdminBannerIcon />,
  },
  {
    name: "Finanzas",
    href: `${actualURL}/finances`,
    icon: <AdminFinancesIcon />,
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

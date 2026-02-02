import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";
import AdminOrdersIcon from "@/src/components/icons/AdminOrdersIcon";
import AdminCouponIcon from "@/src/components/icons/AdminCouponIcon";
import AdminUsersIcon from "@/src/components/icons/AdminUsersIcon";
import AdminBannerIcon from "@/src/components/icons/AdminBannerIcon";
import AdminFinancesIcon from "@/src/components/icons/AdminFinancesIcon";
import OrderIcon from "@/src/components/icons/OrderIcon";
import ProductIcon from "@/src/components/icons/ProductIcon";
import HistoryIcon from "@/src/components/icons/HistoryIcon";
import SupportIcon from "@/src/components/icons/SupportIcon";
import FinancesIcon from "@/src/components/icons/FinancesIcon";
import StarIcon from "@/src/components/icons/StarIcon";
import CategoryIcon from "@/src/components/icons/CategoryIcon";
import { ComponentType } from "react";

export const iconMap: {
  [key: string]: ComponentType<{ className?: string; fill?: string }>;
} = {
  dashboard: Squares2X2Icon,
  orders: AdminOrdersIcon,
  coupons: AdminCouponIcon,
  users: AdminUsersIcon,
  banner: AdminBannerIcon,
  adminFinances: AdminFinancesIcon,
  placements: StarIcon,

  // Partner / Other icons
  order: OrderIcon,
  product: ProductIcon,
  history: HistoryIcon,
  support: SupportIcon,
  finances: FinancesIcon,
  category: CategoryIcon,
};

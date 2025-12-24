import { valueCategories } from "../type";

export type StatData = {
  title: string;
  value: string;
};

export interface Restaurant {
  id: string;
  imageUrl: string;
  name: string;
  nit: string;
  address: string;
  type: valueCategories;
  totalOrders: string;
  state: "active" | "inactive" | "deleted";
  isActive: boolean;
  isApproved: boolean;
  price_markup_percentage: number | null;
  platform_commission_percentage: number | null;
}

export type OrderDir = "asc" | "desc";

export type Sortables = "id" | "name" | "totalOrders";

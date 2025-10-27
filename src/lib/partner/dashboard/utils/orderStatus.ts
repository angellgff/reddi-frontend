// Utilities to handle DB enum public.order_status in UI

export type OrderStatusDb =
  | "pending"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const ACTIVE_ORDER_STATUSES: OrderStatusDb[] = [
  "pending",
  "preparing",
  "out_for_delivery",
];

export function isActiveOrderStatus(status?: string | null): boolean {
  const s = (status || "").toLowerCase() as OrderStatusDb | "";
  return (ACTIVE_ORDER_STATUSES as string[]).includes(s);
}

// Map DB enum to UI label
export function orderStatusToUILabel(
  status?: string | null
): "Nuevo" | "Preparando" | "En camino" | "Entregado" | "Cancelado" {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "pending":
      return "Nuevo";
    case "preparing":
      return "Preparando";
    case "out_for_delivery":
      return "En camino";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return "Nuevo";
  }
}

// ESTOS DATOS SON LOS QUE SE SUPONE QUE VENDRAN DE LA BASE DE DATOS / API

// Estadísticas del dashboard principal
export type MainStatsData = {
  statKey:
    | "active_orders"
    | "today_earnings"
    | "delivered_orders"
    | "active_products"
    | "commissions";
  value: string | React.ReactNode;
};

// Estadísticas de productos
export type ProductsStatsData = {
  statKey: "active_products" | "most_sold" | "inactive_products";
  value: string;
};

// Tipos para la lista de Pedidos Activos
export type OrderStatus = "Preparando" | "Listo" | "Nuevo" | "En camino";

export interface Order {
  id: string;
  name: string;
  details: string; // Ej: "Delivery - 15:45" o "Mesa 2 - 16:00"
  status: OrderStatus;
}

// Tipos para la lista de Notificaciones
export type NotificationType = "error" | "info" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string; // Ej: "Hace 30 min"
}

// Tipo para Productos
export type ProductData = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  categoryId?: string;
};

export type DishData = {
  id: string;
  name: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
};

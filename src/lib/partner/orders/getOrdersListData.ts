import { mockedOrders } from "@/src/app/partner/(session)/restaurant/orders/[id]/page";

export default async function getOrdersListData(
  category: string | string[] | undefined
) {
  // Aqui se hace la petición a la base de datos con la categoría seleccionada
  return mockedOrders;
}

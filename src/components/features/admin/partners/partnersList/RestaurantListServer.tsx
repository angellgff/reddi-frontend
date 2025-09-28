"use server";

import RestaurantList from "./RestaurantList";
import getPartnersData from "@/src/lib/admin/data/partners/getPartnersData";
import { SearchParams } from "@/src/app/admin/(session)/aliados/page";

export default async function RestaurantListServer({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page as string) : 1;
  const q = params.q || "";
  const type = params.type || "";
  const state = params.state || "";
  const orderBy = params.orderBy || "";
  const order = params.order || "";

  // Los parámetros deben pasarse a getPartnersData para obtener los datos filtrados
  const data = await getPartnersData({
    page,
    q: q as string,
    type: type as string,
    state: state as string,
    orderBy: orderBy as string,
    order: order as string,
  });
  return <RestaurantList restaurants={data.restaurants} />;
}

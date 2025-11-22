"use server";

import DriversList from "./DriversList";
import getDriversPage from "@/src/lib/admin/data/drivers/getDriversPage";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function DriversListServer({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page as string) : 1;
  const q = (params.q as string) || "";

  const { drivers } = await getDriversPage({ q }, page, 10);
  return <DriversList drivers={drivers} />;
}

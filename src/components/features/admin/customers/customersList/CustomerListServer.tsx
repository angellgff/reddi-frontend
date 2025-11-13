"use server";

import CustomerList from "./CustomerList";
import getCustomersPage from "@/src/lib/admin/data/customers/getCustomersPage";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function CustomerListServer({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page as string) : 1;
  const q = (params.q as string) || "";
  const orderBy = (params.orderBy as string) || ""; // reserved (sorting handled in client url only for now)
  const order = (params.order as string) || "";

  const { customers } = await getCustomersPage({ q }, page, 10);
  return <CustomerList customers={customers} />;
}

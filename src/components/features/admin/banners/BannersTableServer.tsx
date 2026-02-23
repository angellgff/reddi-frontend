"use server";

import BannersTable from "./BannersTable";
import getBannersData from "@/src/lib/admin/data/banners/getBannersData";

export default async function BannersTableServer({
  searchParams,
  placement,
  editBasePath,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  placement?: string;
  editBasePath?: string;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const fromDate = (params.fromDate as string) || "";
  const toDate = (params.toDate as string) || "";
  const status = (params.status as string) || "";

  const { banners } = await getBannersData({
    page,
    fromDate,
    toDate,
    status,
    placement,
  });

  return <BannersTable banners={banners} editBasePath={editBasePath} />;
}

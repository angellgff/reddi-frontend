import React, { Suspense } from "react";
import Link from "next/link";
import BannersClientShell from "@/src/components/features/admin/banners/BannersClient";
import BannersTableServer from "@/src/components/features/admin/banners/BannersTableServer";
import getBannersStats from "@/src/lib/admin/data/banners/getBannersStats";
import getBannersTotalCount from "@/src/lib/admin/data/banners/getBannersTotalCount";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function YachtBannersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const fromDate = (params.fromDate as string) || "";
  const toDate = (params.toDate as string) || "";
  const status = (params.status as string) || "";

  const statsPromise = getBannersStats("yacht_section");
  const countPromise = getBannersTotalCount({
    fromDate,
    toDate,
    status,
    placement: "yacht_section",
  });

  const [stats, totalCount] = await Promise.all([statsPromise, countPromise]);

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-semibold text-2xl mb-2">Banners Yacht Section</h1>
          <h2 className="font-roboto font-normal text-[#454545]">
            Administra banners exclusivos para la sección de yates (GIF máx. 3MB).
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/banners"
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#04BD88] text-[#04BD88] rounded-[12px] font-poppins font-medium text-sm transition-colors hover:bg-[#e8fff7]"
          >
            Ver todos
          </Link>
          <Link
            href="/admin/banners/yacht-section/create"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#04BD88] hover:bg-green-600 text-white rounded-[12px] font-poppins font-medium text-sm transition-colors"
            style={{
              boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
            }}
          >
            Crear Banner Yacht
          </Link>
        </div>
      </div>

      <BannersClientShell
        stats={stats}
        totalCount={totalCount}
        tableBody={
          <Suspense fallback={<div className="p-4 text-center">Cargando Banners...</div>}>
            <BannersTableServer
              searchParams={searchParams}
              placement="yacht_section"
              editBasePath="/admin/banners/yacht-section/edit"
            />
          </Suspense>
        }
      />
    </div>
  );
}

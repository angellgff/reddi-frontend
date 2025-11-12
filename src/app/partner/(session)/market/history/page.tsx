import HistoryServer from "@/src/components/features/partner/history/HistoryServer";

export default async function MarketHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  return <HistoryServer searchParams={sp} />;
}

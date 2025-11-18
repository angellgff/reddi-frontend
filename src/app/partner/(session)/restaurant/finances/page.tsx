import FinancesServer from "@/src/components/features/partner/finances/FinancesServer";

export default async function Page({
  searchParams,
}: {
  // 2. El tipo de 'searchParams' se define como una Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <FinancesServer searchParams={resolvedSearchParams || {}} />;
}

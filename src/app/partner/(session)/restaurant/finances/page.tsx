import FinancesServer from "@/src/components/features/partner/finances/FinancesServer";

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return <FinancesServer searchParams={searchParams || {}} />;
}

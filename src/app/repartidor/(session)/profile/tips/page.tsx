import TipsPageClient from "./TipsPageClient";
import { getTipsHistory } from "@/src/lib/actions/repartidor/getTipsHistory";

export default async function TipsPage() {
  const { thisWeek, thisMonth } = await getTipsHistory();

  return <TipsPageClient thisWeek={thisWeek} thisMonth={thisMonth} />;
}

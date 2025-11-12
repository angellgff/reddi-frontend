import Spinner from "@/src/components/basics/Spinner";

export default function MarketOrdersSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}

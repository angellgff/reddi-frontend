import StatCardSkeleton from "./StatCardSkeleton";
export default function StatSectionSkeleton({ count = 4 }: { count?: number }) {
  const countString = count.toString();
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-${countString} xl:grid-cols-${countString} mb-4`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

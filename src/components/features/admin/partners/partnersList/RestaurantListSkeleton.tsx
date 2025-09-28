import Spinner from "@/src/components/basics/Spinner";

export default function RestaurantListSkeleton() {
  return (
    <div className="flex items-center justify-center h-96">
      <Spinner />
    </div>
  );
}

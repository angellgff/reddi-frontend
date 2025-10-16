import Spinner from "@/src/components/basics/Spinner";

export default function OrdersSkeleton() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}

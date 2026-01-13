import { Skeleton } from "@/src/components/ui/skeleton";

export default function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-8">
        <Skeleton className="mx-auto h-12 w-3/4 rounded-full" /> {/* Stepper */}
      </div>

      <div className="space-y-6 rounded-xl border p-6 shadow-sm">
        <Skeleton className="h-8 w-48" /> {/* Step Title */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="h-64 rounded-xl bg-gray-100">
            <Skeleton className="h-full w-full rounded-xl" />{" "}
            {/* Map or Summary */}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

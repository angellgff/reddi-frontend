import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent } from "@/src/components/ui/card";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header Profile Info */}
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 text-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Profile Sections */}
      <div className="space-y-4">
        {/* Personal Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 mb-4" /> {/* Section Title */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Payments Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

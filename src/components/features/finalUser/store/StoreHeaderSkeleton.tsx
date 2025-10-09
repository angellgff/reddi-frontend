export default function StoreHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

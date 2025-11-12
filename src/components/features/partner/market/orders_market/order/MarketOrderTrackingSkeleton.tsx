export default function MarketOrderTrackingSkeleton() {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-8 mt-4 text-sm">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
      <div className="relative w-full grow rounded-2xl bg-gray-200"></div>
      <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

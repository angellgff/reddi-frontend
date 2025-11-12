export default function MarketOrderDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded-lg"></div>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div className="my-6 space-y-4">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
            </div>
            <hr className="border-gray-200" />
          </div>
        ))}
      </div>
      <hr className="border-gray-200" />
      <div className="my-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <hr className="border-gray-200" />
      <div className="flex justify-between items-center my-4">
        <div className="h-7 w-16 bg-gray-200 rounded-lg"></div>
        <div className="h-7 w-28 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="bg-gray-200 p-4 rounded-2xl flex items-center gap-4">
        <div className="bg-gray-300 h-14 w-14 rounded-lg flex-shrink-0"></div>
        <div className="w-full space-y-2">
          <div className="h-5 w-3/4 bg-gray-300 rounded-lg"></div>
          <div className="h-4 w-full bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

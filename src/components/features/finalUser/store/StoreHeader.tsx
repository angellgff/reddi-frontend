"use client";

import type { StoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";

export default function StoreHeader({ store }: { store: StoreDetails }) {
  return (
    <div className="flex items-center gap-4">
      {store.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.image_url}
          alt={store.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gray-200" />
      )}
      <div>
        <h1 className="text-xl font-semibold">{store.name}</h1>
        {store.address && (
          <p className="text-sm text-gray-500">{store.address}</p>
        )}
      </div>
    </div>
  );
}

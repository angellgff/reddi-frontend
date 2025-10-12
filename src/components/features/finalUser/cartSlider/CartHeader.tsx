import Image from "next/image";

export default function CartHeader({
  partnerName,
  address,
  itemsCount,
  logoUrl,
}: {
  partnerName: string;
  address: string;
  itemsCount: number;
  logoUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100 border">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={partnerName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs text-gray-500">
            Logo
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{partnerName}</div>
        <div className="text-xs text-gray-600">{address}</div>
      </div>
      <div className="h-7 min-w-7 px-2 rounded-full border text-xs grid place-items-center">
        {itemsCount}
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getPartnersList } from "@/src/lib/finalUser/stores/getPartnersList";

export default async function HomePartnersList() {
  const partners = await getPartnersList();

  // Show nothing if no partners
  if (!partners || partners.length === 0) return null;

  return (
    <div className="flex flex-row overflow-x-auto gap-4 px-4 py-4 no-scrollbar scroll-smooth border-b-[1px] border-[rgba(183,183,183,0.37)]">
      {partners.map((partner) => (
        <Link
          key={partner.id}
          href={partner.href}
          className="flex flex-col items-center gap-2 flex-shrink-0 w-[80px]"
        >
          {/* Image Container */}
          <div className="relative w-[57px] h-[57px] rounded-[14px] border border-[#D9D9D9] shadow-[0px_0px_12px_rgba(0,0,0,0.15)] bg-white overflow-hidden flex items-center justify-center">
            <Image
              src={partner.image}
              alt={partner.name}
              width={57}
              height={57}
              className="w-full h-full object-cover p-1"
            />
          </div>

          {/* Text Name */}
          <span className="text-[10px] font-bold text-center text-black leading-tight font-sans line-clamp-2 w-full">
            {partner.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

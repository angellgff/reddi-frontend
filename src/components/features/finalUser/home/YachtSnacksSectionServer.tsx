import { createClient } from "@/src/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

// Server Component
export default async function YachtSnacksSectionServer() {
  const supabase = await createClient(); // Await createClient

  // Fetch data from partner_placements
  // Using 'home_recommended_carousel' as the logical key for this section on home
  const { data: placements } = await supabase
    .from("partner_placements")
    .select(
      `
      display_order,
      partners (
        id,
        name,
        image_url,
        cover_image_url
      )
    `,
    )
    .eq("section_key", "home_recommended_carousel")
    .order("display_order");

  // Fallback mock data if DB is empty to match the design request visualization
  let items = placements?.filter((p) => p.partners) || [];

  // FORCE MOCK FOR TESTING (10 items)
  if (false) {
    items = Array.from({ length: 10 }).map((_, i) => ({
      partners: {
        id: `mock-${i}`,
        name: i % 2 === 0 ? "El Nacional" : "The Butcher Shop",
        // Using sample cover images or placeholders
        cover_image_url: "",
        image_url: "",
      },
    })) as any;
  }

  return (
    // Main Container - Centered and sized exactly 347px x 166px as per design
    // Using inline style for border-radius to ensure precedence over any conflicting utility classes
    <div
      className="relative w-[347px] h-[166px] mx-auto mt-6 mb-2 overflow-hidden shadow-lg z-0"
      style={{ borderRadius: "14px 81px 14px 14px" }}
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/new-design/nd-yate.png')", // Ensure this path matches public folder
          backgroundColor: "#006d77", // Fallback teal color matching the sea tone
        }}
      >
        <div className="absolute inset-0 bg-black/10" /> {/* Subtle overlay */}
      </div>

      {/* Header Content - Positioned Higher */}
      <div
        className="absolute left-[36px] z-10 text-white"
        style={{ top: "16px" }}
      >
        <h2 className="font-['Open_Sans'] font-bold text-[20px] leading-[22px] drop-shadow-md">
          Directo a tu yate
        </h2>
        <span className="block mt-[4px] font-['Open_Sans'] font-semibold text-[12px] leading-[20px] opacity-90 drop-shadow-sm">
          Snacks
        </span>
      </div>

      {/* Carousel List - Pushed down to avoid overlap */}
      <div
        className="absolute left-[26px] w-full z-20"
        style={{ top: "78px" }} // Explicit positioning to clear header (~60px)
      >
        <div className="flex gap-[16px] overflow-x-auto pl-[16x] pr-[15px] pb-4 no-scrollbar scroll-smooth items-start">
          {items.map((item, i) => {
            const partnerData = item.partners;
            if (!partnerData) return null;

            const partner = Array.isArray(partnerData)
              ? partnerData[0]
              : partnerData;
            if (!partner) return null;

            return (
              <Link
                key={partner.id || i}
                href={`/partner/${partner.id}`}
                className="flex-none flex flex-col items-center w-[79px] group"
              >
                <div className="w-[57px] h-[57px] relative bg-white rounded-[14px] border border-white/20 overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-200">
                  {partner.cover_image_url || partner.image_url ? (
                    <Image
                      src={partner.cover_image_url || partner.image_url!}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="text-[8px]">LOGO</span>
                    </div>
                  )}
                </div>
                <span className="mt-[6px] text-white font-['Open_Sans'] font-bold text-[10px] leading-[1.2] text-center w-full truncate px-1 drop-shadow-md">
                  {partner.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Styles for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

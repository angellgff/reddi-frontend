import { Suspense } from "react";
import { createClient } from "@/src/lib/supabase/server";
import RecommendedSectionServer from "@/src/components/basics/recommended/RecommendedSectionServer";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton";
import OrderAgainServer from "@/src/components/features/finalUser/orderAgain/OrderAgainServer";
import HomeCategories from "@/src/components/features/finalUser/home/HomeCategories";
import HomePartnersList from "@/src/components/features/finalUser/home/HomePartnersList";
import YachtSnacksSectionServer from "@/src/components/features/finalUser/home/YachtSnacksSectionServer";
import HomeFloatingButtonSetter from "@/src/components/features/finalUser/home/HomeFloatingButtonSetter";
import PromoSliderServer from "@/src/components/basics/promos/PromoSliderServer";
import PromoSliderSkeleton from "@/src/components/basics/promos/PromoSliderSkeleton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current hour in Santo Domingo time
  const hour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Santo_Domingo",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  let greeting = "Buenos días";
  if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
  if (hour >= 19) greeting = "Buenas noches";

  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.name || "Francisco";

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen relative">
      <HomeFloatingButtonSetter />

      {/* 2. Categories Row */}
      <HomeCategories />

      {/* 3. Greeting */}
      <div className="px-4 mt-6 mb-4">
        <h1 className="font-openSans text-[20px] font-bold text-black">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* 4. Promo Banner (Vodka placeholder)  */}
      <div className="px-4">
        <Suspense fallback={<PromoSliderSkeleton />}>
          <PromoSliderServer />
        </Suspense>
      </div>

      {/* 2.5 Partners List */}
      <div className="">
        <HomePartnersList />
      </div>

      {/* 5. Recomendados para ti */}
      <div className="px-4 mt-8 space-y-8">
        <Suspense fallback={<SliderSectionSkeleton />}>
          <RecommendedSectionServer
            partnerType="restaurant"
            title="Recomendados para ti"
          />
        </Suspense>
      </div>

      {/* 6. Directo a tu yate Banner */}
      <div className="px-4 mt-8 space-y-8">
        <Suspense
          fallback={
            <div className="h-[190px] w-full bg-gray-50 animate-pulse mt-8" />
          }
        >
          <YachtSnacksSectionServer />
        </Suspense>
      </div>

      {/* 7. Pedidos anteriores */}
      <div className="px-4 mt-8 mb-8">
        <Suspense fallback={<SliderSectionSkeleton />}>
          <OrderAgainServer />
        </Suspense>
      </div>
    </div>
  );
}

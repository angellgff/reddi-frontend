import { Suspense } from "react";
import RecommendedSectionServer from "@/src/components/basics/recommended/RecommendedSectionServer";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton";
import OrderAgainServer from "@/src/components/features/finalUser/orderAgain/OrderAgainServer";
import HomeCategories from "@/src/components/features/finalUser/home/HomeCategories";
import HomePartnersList from "@/src/components/features/finalUser/home/HomePartnersList";
import HomeYachtBanner from "@/src/components/features/finalUser/home/HomeYachtBanner";
import HomeHeader from "@/src/components/features/finalUser/home/HomeHeader";
import HomeFloatingButtonSetter from "@/src/components/features/finalUser/home/HomeFloatingButtonSetter";
import PromoSliderServer from "@/src/components/basics/promos/PromoSliderServer";
import PromoSliderSkeleton from "@/src/components/basics/promos/PromoSliderSkeleton";

export default function Home() {
  return (
    <div className="mx-auto max-w-md bg-white min-h-screen relative">
      <HomeFloatingButtonSetter />

      {/* 2. Categories Row */}
      <HomeCategories />

      {/* 3. Greeting */}
      <div className="px-4 mt-6 mb-4">
        <h1 className="font-openSans text-[20px] font-bold text-black">
          Buenos días, Francisco
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
      <div className="px-4 mt-8">
        <HomeYachtBanner />
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

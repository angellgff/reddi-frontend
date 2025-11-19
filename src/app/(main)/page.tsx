import FeaturedCategories from "@/src/components/features/main/categories/FeaturedCategories";
import DesktopFeaturedCategories from "@/src/components/features/main/categories/DesktopFeaturedCategories";
import LargeCategoryGrid from "@/src/components/features/finalUser/largeCategory/LargeCategoryGrid";
import PromoSliderServer from "@/src/components/basics/promos/PromoSliderServer";
import PromoSliderSkeleton from "@/src/components/basics/promos/PromoSliderSkeleton";
import RecommendedSectionServer from "@/src/components/basics/recommended/RecommendedSectionServer";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton";
import OrderAgainServer from "@/src/components/features/finalUser/orderAgain/OrderAgainServer";
import DesktopHeroSearch from "@/src/components/features/finalUser/hero/DesktopHeroSearch";
import HowItWorksSection from "@/src/components/features/main/HowItWorksSection";
import BenefitsSection from "@/src/components/features/main/BenefitsSection";
import { Suspense } from "react";
// Keeping footer for consistency with existing (main) UX; remove if not desired.
import UserFooter from "@/src/components/basics/UserFooter";
import GuestFooter from "@/src/components/features/layout/GuestFooter";

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-7xl w-full pb-[4.45rem] pt-32 md:pt-36 overflow-x-hidden">
        {/* Hero desktop-only search banner */}
        <DesktopHeroSearch />
        {/* Categorías: mobile grandes + pequeñas; desktop combinado */}
        <section className="px-4 sm:px-6 lg:px-8 md:hidden">
          <LargeCategoryGrid />
        </section>
        <section className="px-4 sm:px-6 lg:px-8 md:hidden mt-6 overflow-x-hidden">
          <FeaturedCategories />
        </section>
        <section className="px-4 sm:px-6 lg:px-8 mt-8">
          <DesktopFeaturedCategories />
        </section>
        {/* Promociones */}
        <section className="px-4 sm:px-6 lg:px-8 mt-12">
          <Suspense fallback={<PromoSliderSkeleton />}>
            <PromoSliderServer />
          </Suspense>
        </section>
        {/* Recomendaciones */}
        <section className="px-4 sm:px-6 lg:px-8 mt-10">
          <Suspense fallback={<SliderSectionSkeleton />}>
            <RecommendedSectionServer />
          </Suspense>
        </section>
        {/* Pedidos anteriores */}
        <section className="px-4 sm:px-6 lg:px-8 mt-10">
          <Suspense fallback={<SliderSectionSkeleton />}>
            <OrderAgainServer />
          </Suspense>
        </section>
        {/* Marketing: Cómo funciona & Beneficios */}
        <section className="px-4 sm:px-6 lg:px-8 mt-16 overflow-x-hidden">
          <HowItWorksSection />
        </section>
        <section className="px-4 sm:px-6 lg:px-8 mt-14 overflow-x-hidden">
          <BenefitsSection />
        </section>
      </div>
      <GuestFooter />
    </>
  );
}

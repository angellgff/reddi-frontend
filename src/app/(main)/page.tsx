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

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-7xl pb-[4.45rem] pt-[9rem]">
        {/* Hero desktop-only search banner */}
        <DesktopHeroSearch />
        {/* Categorías: mobile grandes + pequeñas; desktop combinado */}
        <section className="p-4 md:px-6 lg:px-8 md:hidden">
          <LargeCategoryGrid />
        </section>
        <section className="p-4 md:px-6 lg:px-8 md:hidden">
          <FeaturedCategories />
        </section>
        <section className="p-4 md:px-6 lg:px-8">
          <DesktopFeaturedCategories />
        </section>
        {/* Recomendaciones */}
        <section className="p-4 md:px-6 lg:px-8">
          <Suspense fallback={<SliderSectionSkeleton />}>
            <RecommendedSectionServer />
          </Suspense>
        </section>
        {/* Promociones */}
        <section className="p-4 md:px-6 lg:px-8">
          <Suspense fallback={<PromoSliderSkeleton />}>
            <PromoSliderServer />
          </Suspense>
        </section>
        {/* Secciones marketing: Cómo funciona & Beneficios */}
        <div className="space-y-12 md:space-y-16">
          <HowItWorksSection />
          <BenefitsSection />
        </div>
      </div>
      <UserFooter />
    </>
  );
}

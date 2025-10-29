import FeaturedCategories from "@/src/components/features/main/categories/FeaturedCategories";
import LargeCategoryGrid from "@/src/components/features/finalUser/largeCategory/LargeCategoryGrid";
import DesktopFeaturedCategories from "@/src/components/features/main/categories/DesktopFeaturedCategories";
import PromoSliderServer from "@/src/components/basics/promos/PromoSliderServer";
import PromoSliderSkeleton from "@/src/components/basics/promos/PromoSliderSkeleton";
import RecommendedSectionServer from "@/src/components/basics/recommended/RecommendedSectionServer";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton";
import OrderAgainServer from "@/src/components/features/finalUser/orderAgain/OrderAgainServer";
import DesktopHeroSearch from "@/src/components/features/finalUser/hero/DesktopHeroSearch";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero desktop-only search banner */}
      <DesktopHeroSearch />
      {/* Categorías: en mobile mostramos ambos componentes actuales; en desktop, uno solo combinado */}
      {/* Mobile: grandes */}
      <section className="p-4 md:px-6 lg:px-8 md:hidden">
        <LargeCategoryGrid />
      </section>
      {/* Mobile: pequeñas */}
      <section className="p-4 md:px-6 lg:px-8 md:hidden">
        <FeaturedCategories />
      </section>
      {/* Desktop: único componente */}
      <section className="p-4 md:px-6 lg:px-8">
        <DesktopFeaturedCategories />
      </section>
      {/*Sección de promociones*/}
      <section className="p-4 md:px-6 lg:px-8">
        <Suspense fallback={<PromoSliderSkeleton />}>
          <PromoSliderServer />
        </Suspense>
      </section>
      {/*Sección de recomendaciones*/}
      <section className="p-4 md:px-6 lg:px-8">
        <Suspense fallback={<SliderSectionSkeleton />}>
          <RecommendedSectionServer />
        </Suspense>
      </section>
      {/*Sección de pedidos anteriores*/}
      <section className="p-4 md:px-6 lg:px-8">
        <Suspense fallback={<SliderSectionSkeleton />}>
          <OrderAgainServer />
        </Suspense>
      </section>
    </div>
  );
}

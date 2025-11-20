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
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
// Keeping footer for consistency with existing (main) UX; remove if not desired.
import GuestFooter from "@/src/components/features/layout/GuestFooter";

function getHomePathForRole(role?: string | null) {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "market":
      return "/partner/market/dashboard";
    case "restaurant":
      return "/partner/restaurant/dashboard";
    case "delivery":
      return "/repartidor/home";
    default:
      return "/user/home";
  }
}

export default async function Home() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      let role: string | null = null;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        role = profile?.role ?? null;
      } catch (profileError) {
        console.warn("Failed to load profile for role", profileError);
      }

      if (!role) {
        const appMeta = (user.app_metadata as Record<string, any>) || {};
        const userMeta = (user.user_metadata as Record<string, any>) || {};
        role =
          (appMeta?.user_role as string) ||
          (appMeta?.role as string) ||
          (userMeta?.user_role as string) ||
          (userMeta?.role as string) ||
          null;
      }

      const destination = getHomePathForRole(role);
      if (destination) {
        // Redirect authenticated users straight to their role home.
        redirect(destination);
      }
    }
  } catch (error) {
    console.warn("Home session pre-check failed", error);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl w-full pb-[4.45rem] pt-32 md:pt-36 overflow-x-hidden">
        {/* Hero desktop-only search banner */}
        <DesktopHeroSearch />
        {/* Categorías: mobile grandes + pequeñas; desktop combinado */}
        <section className="p-4 sm:px-6 lg:px-8 md:hidden">
          <LargeCategoryGrid />
        </section>
        <section className="p-4 sm:px-6 lg:px-8 md:hidden overflow-x-hidden">
          <FeaturedCategories />
        </section>

        <DesktopFeaturedCategories />

        <div className="px-4 md:px-6 lg:px-8">
          <hr className="border-gray-200 my-4" />
        </div>
        {/* Promociones */}
        <section className="p-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PromoSliderSkeleton />}>
            <PromoSliderServer />
          </Suspense>
        </section>
        {/* Recomendaciones */}
        <section className="p-4 sm:px-6 lg:px-8 ">
          <Suspense fallback={<SliderSectionSkeleton />}>
            <RecommendedSectionServer />
          </Suspense>
        </section>
        {/* Pedidos anteriores */}
        <section className="p-4 sm:px-6 lg:px-8 ">
          <Suspense fallback={<SliderSectionSkeleton />}>
            <OrderAgainServer />
          </Suspense>
        </section>
        {/* Marketing: Cómo funciona & Beneficios */}
        <section className="p-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <HowItWorksSection />
        </section>
        <section className="p-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <BenefitsSection />
        </section>
      </div>
      <GuestFooter />
    </>
  );
}

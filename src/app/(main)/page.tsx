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

export default async function Home(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const code = searchParams?.code;

  if (code) {
    // If we land here with an auth code, it means the Auth Provider redirected to root
    // instead of the callback. We intercept and forward to the callback to finish login.
    const codeValue = Array.isArray(code) ? code[0] : code;
    console.log("[Home] Redirecting to callback with code", codeValue);
    redirect(`/auth/callback?code=${codeValue}`);
  }

  const supabase = await createClient();
  let destination: string | null = null;

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
        const appMeta = (user.app_metadata as Record<string, unknown>) || {};
        const userMeta = (user.user_metadata as Record<string, unknown>) || {};
        role =
          (appMeta?.user_role as string) ||
          (appMeta?.role as string) ||
          (userMeta?.user_role as string) ||
          (userMeta?.role as string) ||
          null;
      }

      destination = getHomePathForRole(role);
    }
  } catch (error) {
    console.warn("Home session pre-check failed", error);
  }

  if (destination) {
    // Redirect authenticated users outside the try-catch block to avoid catching the NEXT_REDIRECT error
    redirect(destination);
  }

  // Redirect unauthenticated users to login as this page is no longer used as a landing page
  redirect("/auth/login");

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

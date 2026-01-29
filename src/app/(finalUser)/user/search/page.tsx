import { searchPartners } from "@/src/lib/finalUser/search/searchPartners";
import SearchResultsGrid from "@/src/components/features/finalUser/search/SearchResultsGrid";
import SearchFilters from "@/src/components/features/finalUser/search/SearchFilters";
import DesktopPageSearchBar from "@/src/components/features/finalUser/search/DesktopPageSearchBar";
import CustomSearchHeader from "@/src/components/features/finalUser/search/CustomSearchHeader";
import MobileSearchBar from "@/src/components/features/finalUser/search/MobileSearchBar";
import PartnerAccordionList from "@/src/components/features/finalUser/search/PartnerAccordionList";
import Image from "next/image";
import { Suspense } from "react";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton";
import SearchRecommendedServer from "@/src/components/features/finalUser/search/SearchRecommendedServer";
import SearchPromoSlider from "@/src/components/features/finalUser/search/SearchPromoSlider";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    minRating?: string;
  }>;
}

function getTitleData(type?: string) {
  if (!type) return { title: "Comercios", icon: null };
  if (type.includes("restaurant"))
    return { title: "Restaurantes", icon: "/Restaurants.svg" };
  if (type.includes("market")) return { title: "Mercado", icon: "/market-logo.png" };
  if (type.includes("tobacco")) return { title: "Tabaco", icon: "/tabaco.png" };
  if (type.includes("liquor"))
    return { title: "Alcohol", icon: "/alcohol.png" };
  if (type.includes("pharmacy"))
    return { title: "Farmacia", icon: "/farmacia-tiny.png" };
  return { title: "Comercios", icon: null };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const query = resolvedSearchParams.q || "";
  const types = resolvedSearchParams.type
    ? resolvedSearchParams.type.split(",")
    : undefined;
  const sort = resolvedSearchParams.sort;
  const minRating = resolvedSearchParams.minRating
    ? Number(resolvedSearchParams.minRating)
    : undefined;

  const results = await searchPartners({
    query,
    types,
    sort,
    minRating,
  });

  const { title, icon } = getTitleData(
    resolvedSearchParams.type || (types ? types[0] : undefined)
  );

  return (
    <div className="mx-auto max-w-7xl md:p-4 md:px-6 lg:px-8">
      {/* Mobile-only Header Overrides */}
      <CustomSearchHeader title={title} icon={icon} />

      <div className="pt-10 px-4 md:px-0">
        {/* Search Bar Mobile */}
        <MobileSearchBar placeholder="Busca en El Nacional" />

        {/* Promo Slider Mobile */}
        <SearchPromoSlider />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <SearchFilters />
          </div>

          <div className="flex-1">
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl mt-4">
                No encontramos {title.toLowerCase()} con esos filtros.
              </div>
            ) : (
              <>
                <DesktopPageSearchBar />

                {/* Mobile Title for List */}
                <div className="md:hidden font-bold text-xl mb-4 font-[Open Sans] text-black">
                  {query ? `Resultados para "${query}"` : `Todos los ${title}`}
                </div>

                {/* Mobile Accordion List */}
                <div className="md:hidden">
                  <PartnerAccordionList partners={results} />
                </div>

                {/* Mobile Recommended Slider (Reused from Home) */}
                <div className="md:hidden mt-8 mb-8">
                  <Suspense fallback={<SliderSectionSkeleton />}>
                    <SearchRecommendedServer title="Recomendados para ti" />
                  </Suspense>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:block">
                  <SearchResultsGrid products={results} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

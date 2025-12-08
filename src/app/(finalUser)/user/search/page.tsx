import { searchPartners } from "@/src/lib/finalUser/search/searchPartners";
import SearchResultsGrid from "@/src/components/features/finalUser/search/SearchResultsGrid";
import SearchFilters from "@/src/components/features/finalUser/search/SearchFilters";
import DesktopPageSearchBar from "@/src/components/features/finalUser/search/DesktopPageSearchBar";

interface PageProps {
  searchParams: {
    q?: string;
    type?: string;
    sort?: string;
    minRating?: string;
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || "";
  const types = searchParams.type ? searchParams.type.split(",") : undefined;
  const sort = searchParams.sort;
  const minRating = searchParams.minRating ? Number(searchParams.minRating) : undefined;

  const results = await searchPartners({
    query,
    types,
    sort,
    minRating,
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Resultados para "${query}"` : "Búsqueda de Comercios"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0">
          <SearchFilters />
        </div>

        {/* Results */}
        <div className="flex-1">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              No encontramos comercios con esos filtros.
            </div>
          ) : (
            <>
              <DesktopPageSearchBar />
              <SearchResultsGrid products={results} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

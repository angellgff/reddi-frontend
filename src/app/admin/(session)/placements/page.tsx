import { getPlacements } from "@/src/lib/admin/data/placements/getPlacements";
import { PlacementsManager } from "@/src/components/features/admin/placements/PlacementsManager";

export const dynamic = "force-dynamic";

export default async function PlacementsPage() {
  const placements = await getPlacements();

  return (
    <div className="p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Partner Placements
        </h1>
        <p className="text-gray-500 mt-2">
          Gestiona los partners destacados en las diferentes secciones de la
          app.
        </p>
      </div>
      <PlacementsManager initialPlacements={placements} />
    </div>
  );
}

import ViewProfileServer from "@/src/components/features/admin/partners/viewPartner/ViewProfileServer";
import ViewProfileSkeleton from "@/src/components/features/admin/partners/viewPartner/ViewProfileSkeleton";
import { Suspense } from "react";

export default async function ViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-normal">
        <span className="font-semibold">Perfil del</span> aliado
      </h1>
      {/* Fila 1: Sección de filtros */}
      <div className="mt-4 bg-white p-6 rounded-xl">
        <Suspense fallback={<ViewProfileSkeleton />}>
          <ViewProfileServer id={id} />
        </Suspense>
      </div>
    </div>
  );
}

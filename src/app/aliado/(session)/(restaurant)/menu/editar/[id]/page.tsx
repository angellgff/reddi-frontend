import { Suspense } from "react";
import EditDishServer from "@/src/components/features/partner/dashboard/menu/editDish/EditDishServer";
import EditDishSkeleton from "@/src/components/features/partner/dashboard/menu/editDish/EditDishSkeleton";

export default async function DishEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Editar plato</h1>

      <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <Suspense fallback={<EditDishSkeleton />}>
          <EditDishServer id={id} />
        </Suspense>
      </section>
    </div>
  );
}

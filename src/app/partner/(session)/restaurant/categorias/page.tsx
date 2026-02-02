import { Suspense } from "react";
import { getPartnerCategories } from "./actions";
import CategoriesClient from "@/src/components/features/partner/dashboard/categories/CategoriesClient";
import Spinner from "@/src/components/basics/Spinner";

export default async function CategoriasPage() {
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Categorías</h1>
      <h2 className="font-roboto font-normal mb-5">
        Gestiona las categorías de tu menú
      </h2>

      {/* Lista de Categorías */}
      <section className="bg-white px-10 py-6 rounded-xl">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          <CategoriesLoader />
        </Suspense>
      </section>
    </div>
  );
}

async function CategoriesLoader() {
  const categories = await getPartnerCategories();
  return <CategoriesClient initialCategories={categories} />;
}

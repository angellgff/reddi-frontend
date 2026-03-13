import { Suspense } from "react";
import { getPartnerCategories } from "./actions";
import CategoriesClient from "@/src/components/features/partner/dashboard/categories/CategoriesClient";
import Spinner from "@/src/components/basics/Spinner";

export default async function CategoriasPage() {
  return (
    <div className="p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-gray-500 mt-2">
          Gestiona y ordena las categorías de tu menú.
        </p>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-sm border">
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

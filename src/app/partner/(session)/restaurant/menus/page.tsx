import { Suspense } from "react";
import Spinner from "@/src/components/basics/Spinner";
import MenusClient from "./MenusClient";
import { getPartnerMenusData } from "./actions";

export default async function RestaurantMenusPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
        <p className="mt-2 text-gray-500">
          Administra horarios, dias, activacion y subcategorias por menu.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          }
        >
          <MenusLoader />
        </Suspense>
      </section>
    </div>
  );
}

async function MenusLoader() {
  const data = await getPartnerMenusData();
  return <MenusClient initialData={data} />;
}

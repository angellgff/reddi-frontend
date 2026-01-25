import { getCategories } from "@/src/lib/admin/categories/data";
import BasicButton from "@/src/components/basics/BasicButton";
import Link from "next/link";
import Image from "next/image";
import DeleteCategoryButton from "./_components/DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">Gestiona las categorías de la plataforma.</p>
        </div>
        <Link href="/admin/categories/create">
          <BasicButton 
            className="w-auto px-4 py-2 bg-primary text-white hover:bg-primary/90 font-medium text-sm"
          >
            Nueva Categoría
          </BasicButton>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Imagen</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Descripción</th>
                <th className="px-6 py-4 font-semibold text-gray-900 max-w-[150px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No hay categorías creadas
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {category.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                           <span className="text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                         {/* Edit logic can be added later */}
                         <DeleteCategoryButton id={category.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

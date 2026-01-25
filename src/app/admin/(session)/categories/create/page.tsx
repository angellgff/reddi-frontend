import CategoryForm from "../_components/CategoryForm";
import Link from "next/link";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";

export default function CreateCategoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/categories"
          className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition-colors inline-flex items-center justify-center"
        >
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Categoría</h1>
          <p className="text-gray-500">
            Crea una nueva categoría para clasificar productos o aliados.
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}

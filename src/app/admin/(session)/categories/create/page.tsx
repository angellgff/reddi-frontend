import CategoryForm from "../_components/CategoryForm";
import BasicBackButton from "@/src/components/basics/BasicBackButton";

export default function CreateCategoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BasicBackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Categoría</h1>
          <p className="text-gray-500">Crea una nueva categoría para clasificar productos o aliados.</p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}

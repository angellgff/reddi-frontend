import DishesSection from "./DishesSection";
import getRealDishesData from "@/src/lib/partner/dashboard/data/products/getRealDishesData";
import getSubCategories from "@/src/lib/partner/dashboard/data/products/getSubCategories";
import { dishesTags } from "@/src/lib/type"; // Keep mock tags (no tag system yet)

interface DishesServerProps {
  category: string[] | string | undefined;
  tag: string[] | string | undefined;
  q: string[] | string | undefined;
}

// Se reciben los parámetros de búsqueda desde la URL
export default async function DishesServer({
  category,
  tag,
  q,
}: DishesServerProps) {
  // Se hace la petición para obtener los datos de los platillos
  const [dishes, categoriesOpts] = await Promise.all([
    getRealDishesData({ q, category, tag }),
    getSubCategories(),
  ]);

  return (
    <DishesSection
      dishes={dishes}
      categories={categoriesOpts}
      tags={categoriesOpts}
    />
  );
}

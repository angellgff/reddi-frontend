import DishesSection from "./DishesSection";
import getDishesData from "@/src/lib/partner/dashboard/data/products/getDishesData";
import { dishesTags } from "@/src/lib/type";

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
  const data = await getDishesData();

  return (
    <DishesSection dishes={data} categories={dishesTags} tags={dishesTags} />
  );
}

import DishesSection from "./DishesSection";
import getRealDishesData from "@/src/lib/partner/dashboard/data/products/getRealDishesData";
import getSubCategories from "@/src/lib/partner/dashboard/data/products/getSubCategories";
import { dishesTags } from "@/src/lib/type"; // Keep mock tags (no tag system yet)
import { createClient } from "@/src/lib/supabase/server";

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
  // Resolver partnerId del aliado autenticado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let partnerId: string | null = null;
  if (user) {
    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();
    partnerId = partner?.id || null;
  }

  // Se hace la petición para obtener los datos de los platillos
  const [dishes, categoriesOpts] = await Promise.all([
    getRealDishesData({ q, category, tag, partnerId: partnerId || undefined }),
    partnerId ? getSubCategories(partnerId) : Promise.resolve([]),
  ]);

  return (
    <DishesSection
      dishes={dishes}
      categories={categoriesOpts}
      tags={categoriesOpts}
    />
  );
}

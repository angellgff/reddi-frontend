import EditDishWizard from "./EditDishWizard";
import { getDishById } from "@/src/lib/partner/dashboard/data/products/getDishByIdData";
export default async function EditDishServer({ id }: { id: string }) {
  const data = await getDishById({ id });
  return <EditDishWizard id={id} data={data} />;
}

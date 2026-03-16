import Spinner from "@/src/components/basics/Spinner";
import DishFormModal from "@/src/components/features/partner/dashboard/menu/dishesList/DishFormModal";

interface LoadingDishFormModalProps {
  closeHref: string;
  title?: string;
}

export default function LoadingDishFormModal({
  closeHref,
  title = "Cargando editor...",
}: LoadingDishFormModalProps) {
  return (
    <DishFormModal title={title} closeHref={closeHref}>
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner />
      </div>
    </DishFormModal>
  );
}

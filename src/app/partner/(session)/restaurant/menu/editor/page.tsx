import Link from "next/link";
import { getMenuEditorInitialData } from "./actions";
import MenuEditorClient from "./MenuEditorClient";

export default async function MenuEditorPage() {
  const initialData = await getMenuEditorInitialData();

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-4 py-5 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Store Preview</h1>
          <p className="text-sm text-[#5D6472]">
            Reordena subcategorías y productos desde una vista móvil simulada.
          </p>
        </div>
        <Link
          href="/partner/restaurant/menu"
          className="rounded-xl border border-[#D9DCE3] bg-white px-4 py-2 text-sm font-medium text-[#202124] hover:bg-[#F8F9FB]"
        >
          Volver al menú
        </Link>
      </div>

      <MenuEditorClient initialData={initialData} />
    </div>
  );
}

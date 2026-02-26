import SalesHistoryTable, {
  type SalesHistoryRow,
} from "@/src/components/features/partner/finances/SalesHistoryTable";

type Filters = { from?: string; to?: string; status?: string };

export default function HistoryView({
  rows,
  page,
  totalPages,
  totalCount,
  filters,
}: {
  rows: SalesHistoryRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  filters?: Filters;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-6 xl:px-8">
      <section className="mt-5 rounded-2xl bg-white p-5">
        <h2 className="text-[18px] font-semibold leading-[22px] text-[#1F2937]">
          Filtros
        </h2>

        <form
          method="get"
          className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end"
        >
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-black">
              Desde
            </label>
            <input
              type="date"
              name="from"
              defaultValue={filters?.from}
              className="h-10 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 text-sm text-black outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-black">
              Hasta
            </label>
            <input
              type="date"
              name="to"
              defaultValue={filters?.to}
              className="h-10 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 text-sm text-black outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-black">
              Estados
            </label>
            <select
              name="status"
              defaultValue={filters?.status || ""}
              className="h-10 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 text-sm text-black outline-none"
            >
              <option value="">Seleccione</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="?"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#202124] bg-white px-5 text-sm font-medium text-[#202124]"
            >
              Limpiar filtros
            </a>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#595959] px-5 text-sm font-medium text-white"
            >
              Filtrar
            </button>
          </div>
        </form>
      </section>

      <div className="mt-5">
        <SalesHistoryTable
          rows={rows}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          filters={filters}
        />
      </div>
    </div>
  );
}

import {
  ArrowUp,
  ArrowDown,
  BadgeDollarSign,
  CalendarCheck2,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
} from "lucide-react";
import type { ReactNode } from "react";
import SalesHistoryTable, { type SalesHistoryRow } from "./SalesHistoryTable";

export type FinanceRow = SalesHistoryRow;

export type FinanceFilters = { from?: string; to?: string; status?: string };

function FinanceStatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
}) {
  const trendValue = Number.parseFloat((trend || "0").replace("%", ""));
  const isPositive = trendValue > 0;
  const isNeutral = trendValue === 0;

  return (
    <article className="flex h-[134px] w-full min-w-0 flex-col items-start gap-3 rounded-2xl bg-white px-4 pb-0 pt-4 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]">
      <div className="flex h-[74px] w-full items-start justify-between">
        <div className="flex h-[74px] flex-1 flex-col items-start gap-2">
          <h3 className="text-[12px] font-normal leading-[18px] text-[#6B7280]">
            {title}
          </h3>
          <p className="text-[24px] font-bold leading-[30px] tracking-[0.14px] text-[#101010]">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#13835F]">
          <span className="text-white">{icon}</span>
        </div>
      </div>

      <div className="flex h-[16.5px] w-full items-center gap-1">
        {isPositive ? (
          <ArrowUp className="h-3 w-3 text-[#10B981]" strokeWidth={2} />
        ) : (
          <ArrowDown
            className={`h-3 w-3 ${isNeutral ? "text-[#6B7280]" : "text-[#EF4444]"}`}
            strokeWidth={2}
          />
        )}
        <p
          className={`text-[11px] font-semibold leading-4 tracking-[0.129px] ${
            isPositive
              ? "text-[#10B981]"
              : isNeutral
                ? "text-[#6B7280]"
                : "text-[#EF4444]"
          }`}
        >
          {trend}
        </p>
      </div>
    </article>
  );
}

export default function FinancesView({
  rows,
  filters,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  stats = {
    todayIncome: "$0",
    bestSellers: "$0",
    monthIncome: "$0",
    ordersCompleted: "0",
    commissions: "$0",
    trends: {
      todayIncome: "0.0%",
      bestSellers: "0.0%",
      monthIncome: "0.0%",
      ordersCompleted: "0.0%",
      commissions: "0.0%",
    },
  },
}: {
  rows: FinanceRow[];
  filters?: FinanceFilters;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  stats?: {
    todayIncome: string;
    bestSellers: string;
    monthIncome: string;
    ordersCompleted: string;
    commissions: string;
    trends: {
      todayIncome: string;
      bestSellers: string;
      monthIncome: string;
      ordersCompleted: string;
      commissions: string;
    };
  };
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-6 xl:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FinanceStatCard
          title="Ingreso de Hoy"
          value={stats.todayIncome}
          icon={<HandCoins size={20} />}
          trend={stats.trends.todayIncome}
        />
        <FinanceStatCard
          title="Más Vendidos"
          value={stats.bestSellers}
          icon={<ReceiptText size={20} />}
          trend={stats.trends.bestSellers}
        />
        <FinanceStatCard
          title="Ingresos del Mes"
          value={stats.monthIncome}
          icon={<CircleDollarSign size={20} />}
          trend={stats.trends.monthIncome}
        />
        <FinanceStatCard
          title="Pedidos completados"
          value={stats.ordersCompleted}
          icon={<CalendarCheck2 size={20} />}
          trend={stats.trends.ordersCompleted}
        />
        <FinanceStatCard
          title="Comisiones"
          value={stats.commissions}
          icon={<BadgeDollarSign size={20} />}
          trend={stats.trends.commissions}
        />
      </div>

      <div className="mt-6">
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

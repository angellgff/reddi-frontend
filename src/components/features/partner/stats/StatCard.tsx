// src/components/ui/StatCard.tsx
import React from "react";

export default function StatCard({
  title,
  value,
  trendPercentage,
  children,
}: {
  title: string;
  value: string | React.ReactNode;
  trendPercentage?: number | null;
  children: React.ReactNode;
}) {
  const isCommissions = title.toLowerCase().includes("comisión");
  const isStringValue = typeof value === "string";
  const trendValue = Number.isFinite(trendPercentage)
    ? Number(trendPercentage)
    : null;
  const isNegativeTrend = (trendValue ?? 0) < 0;

  const formatTrend = (value: number) => {
    const abs = Math.abs(value);
    const rounded = abs.toFixed(1).replace(".", ",");
    return `${value >= 0 ? "↗ +" : "↘ -"}${rounded}%`;
  };

  return (
    <div className="rounded-lg border border-[#EDEDED] bg-white px-4 pb-3 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-openSans text-xs font-normal text-[#383838]">
          {title}
        </p>
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#DEF6F0]">
          {children}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="min-w-0">
          {isStringValue ? (
            <p className="font-inter text-[31px] font-semibold leading-none text-[#101010]">
              {value}
            </p>
          ) : (
            <div className="text-[#101010]">{value}</div>
          )}

          {!isCommissions && (
            <p className="mt-1 font-inter text-xs font-semibold text-[#878787]">
              VS last month
            </p>
          )}
        </div>

        {!isCommissions && trendValue !== null && (
          <div
            className={`rounded-full px-2 py-1 font-manrope text-[11px] font-bold leading-4 ${
              isNegativeTrend
                ? "bg-[#FFF5F5] text-[#F14141]"
                : "bg-[#F5FFFA] text-[#50CD89]"
            }`}
          >
            {formatTrend(trendValue)}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PartnerWeeklyRevenuePoint } from "@/src/lib/partner/dashboard/data/main/getRevenueChartData";

const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000) return `$${Math.round(tickItem / 1000)}k`;
  return `$${Math.round(tickItem)}`;
};

export default function RevenueLineChart({
  data,
}: {
  data: PartnerWeeklyRevenuePoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
        <XAxis dataKey="day" stroke="#878787" fontSize={12} tickLine={false} />
        <YAxis
          stroke="#878787"
          fontSize={12}
          tickLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #EDEDED",
            borderRadius: 8,
          }}
          formatter={(value: number) => [
            `$${value.toLocaleString()}`,
            "Ingresos",
          ]}
        />
        <Legend iconType="line" wrapperStyle={{ paddingTop: 8 }} />

        <Area
          type="monotone"
          dataKey="Semana anterior"
          stroke="#8A8C90"
          fill="url(#prevGradient)"
          strokeWidth={2}
          dot={{ r: 3, fill: "#8A8C90" }}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="Esta semana"
          stroke="#50CD89"
          fill="url(#thisGradient)"
          strokeWidth={2}
          dot={{ r: 3, fill: "#50CD89" }}
          activeDot={{ r: 4 }}
        />

        <defs>
          <linearGradient id="prevGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8A8C90" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8A8C90" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="thisGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#50CD89" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#50CD89" stopOpacity={0} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

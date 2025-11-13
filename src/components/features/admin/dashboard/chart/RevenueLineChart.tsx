// src/components/features/admin/dashboard/chart/RevenueLineChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyRevenuePoint } from "@/src/lib/admin/data/dashboard/getChartData";

// Formateador para el eje Y (ej: 10000 -> 10k)
const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000) {
    return `${tickItem / 1000}k`;
  }
  return tickItem.toString();
};

export default function RevenueLineChart({
  data,
}: {
  data: WeeklyRevenuePoint[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10, // Ajusta el margen para que se vea bien
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="day"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Ingresos"]}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{
            paddingTop: "20px",
          }}
        />
        <Line
          type="monotone"
          dataKey="Esta semana"
          stroke="#3b82f6" // Azul
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="Semana anterior"
          stroke="#d1d5db" // Gris
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

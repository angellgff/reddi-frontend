import StatCard from "@/src/components/features/partner/stats/StatCard";
import React from "react";

type StatCardSectionProps<T> = {
  // `stats` ahora es un array de cualquier tipo `T`
  stats: T[];

  // `getKey` es una función que le dice al componente CÓMO obtener una clave única de un objeto de tipo `T`.
  getKey: (item: T) => string;

  // `getValue` es una función que le dice al componente CÓMO obtener el valor a mostrar.
  getValue: (item: T) => string | React.ReactNode;
  getTrend?: (item: T) => number | null | undefined;

  // Los mapas ahora usan `string` como clave, ya que es lo que devolverá `getKey`.
  iconMap: Record<string, React.ReactNode>;
  titleMap: Record<string, string>;
};

// 2. El componente ahora es una función genérica `<T>`
export default function StatCardSection<T>({
  stats,
  getKey,
  getValue,
  getTrend,
  iconMap,
  titleMap,
}: StatCardSectionProps<T>) {
  const n = stats.length;
  const colsClass =
    n >= 5
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      : n === 4
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        : n === 3
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : n === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1";

  return (
    <div className={`mb-4 grid gap-4 ${colsClass}`}>
      {stats.map((item) => {
        const key = getKey(item);
        const value = getValue(item);

        const icon = iconMap[key];
        const title = titleMap[key];

        if (!title || !icon) {
          console.warn(`No se encontró título o ícono para la clave: "${key}"`);
          return null;
        }

        return (
          <StatCard
            key={key}
            title={title}
            value={value}
            trendPercentage={getTrend ? getTrend(item) : undefined}
          >
            {icon}
          </StatCard>
        );
      })}
    </div>
  );
}

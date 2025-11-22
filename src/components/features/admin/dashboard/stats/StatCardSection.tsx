import StatCard from "@/src/components/features/admin/dashboard/stats/StatCard";
import StatCarIcon from "@/src/components/icons/StatCarIcon";
import StatDollarIcon from "@/src/components/icons/StatDollarIcon";
import StatDeliveryIcon from "@/src/components/icons/StatDeliveryIcon";
import StatPartnersIcon from "@/src/components/icons/StatPartnersIcon";
import StatUsersIcon from "@/src/components/icons/StatUsersIcon";

import { StatData } from "@/src/lib/admin/type";

type StatCardSectionProps = {
  stats: StatData[];
};

export default function StatCardSection({ stats }: StatCardSectionProps) {
  // ✅ CORRECCIÓN: Mover la definición adentro.
  // Al estar aquí, esto solo se ejecuta cuando React renderiza el componente,
  // momento en el cual las importaciones ya están 100% garantizadas.
  const icons = [
    <StatCarIcon key={0} />,
    <StatDollarIcon key={1} />,
    <StatDeliveryIcon key={2} />,
    <StatPartnersIcon key={3} />,
    <StatUsersIcon key={4} />,
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mb-4">
      {stats.map((stat, index) => {
        // Protección extra: Si hay más stats que iconos, evita un crash
        const icon = icons[index] || null;

        return (
          <StatCard key={stat.title} title={stat.title} value={stat.value}>
            {icon}
          </StatCard>
        );
      })}
    </div>
  );
}

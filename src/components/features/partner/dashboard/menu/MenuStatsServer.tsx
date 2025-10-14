"use server";

import StatCardSection from "@/src/components/features/partner/stats/StatCardSection";
import { createClient } from "@/src/lib/supabase/server";
import StatCarIcon from "@/src/components/icons/StatCarIcon";
import StatDollarIcon from "@/src/components/icons/StatDollarIcon";
import CompleteOrderIcon from "@/src/components/icons/CompleteOrderIcon";
import type { ProductsStatsData } from "@/src/lib/partner/dashboard/type";

// Mapa de Iconos
const iconMap: Record<ProductsStatsData["statKey"], React.ReactNode> = {
  active_products: <StatCarIcon fill="white" />,
  most_sold: <StatDollarIcon fill="white" />,
  inactive_products: <CompleteOrderIcon fill="white" />,
};

// Mapa de Títulos
const titleMap: Record<ProductsStatsData["statKey"], string> = {
  active_products: "Productos activos",
  most_sold: "Más vendidos",
  inactive_products: "Productos inactivos",
};

export default async function ProductsStasServer() {
  const supabase = await createClient();
  // 1) Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Sin sesión: devolver estadísticas en cero
    const zeroStats = [
      { statKey: "active_products" as const, value: "0" },
      { statKey: "most_sold" as const, value: "0" },
      { statKey: "inactive_products" as const, value: "0" },
    ];
    return (
      <StatCardSection
        stats={zeroStats}
        iconMap={iconMap}
        titleMap={titleMap}
        getKey={(item) => item.statKey}
        getValue={(item) => item.value}
      />
    );
  }

  // 2) Obtener el partner vinculado al usuario
  const { data: partner, error: partnerErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (partnerErr || !partner) {
    console.error(
      "ProductsStasServer: partner no encontrado para user",
      user.id,
      partnerErr
    );
    const zeroStats = [
      { statKey: "active_products" as const, value: "0" },
      { statKey: "most_sold" as const, value: "0" },
      { statKey: "inactive_products" as const, value: "0" },
    ];
    return (
      <StatCardSection
        stats={zeroStats}
        iconMap={iconMap}
        titleMap={titleMap}
        getKey={(item) => item.statKey}
        getValue={(item) => item.value}
      />
    );
  }

  // 3) Traer solo productos del partner autenticado
  const { data, error } = await supabase
    .from("products")
    .select("id,is_available")
    .eq("partner_id", partner.id)
    .limit(5000); // safety cap
  if (error) {
    console.error("Error fetching product stats", error);
  }
  const rows = data || [];
  const active = rows.filter((r) => r.is_available).length;
  const inactive = rows.filter((r) => !r.is_available).length;
  // Placeholder most_sold (needs sales data). Show active again or 0.
  const mostSold = 0;
  const statsData = [
    { statKey: "active_products" as const, value: String(active) },
    { statKey: "most_sold" as const, value: String(mostSold) },
    { statKey: "inactive_products" as const, value: String(inactive) },
  ];
  return (
    <StatCardSection
      stats={statsData}
      iconMap={iconMap}
      titleMap={titleMap}
      getKey={(item) => item.statKey}
      getValue={(item) => item.value}
    />
  );
}

import DeliveryHeader from "@/src/components/features/repartidor/header/DeliveryHeader";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient(); // createClient ahora es una función síncrona en las últimas versiones

  // --- CORRECCIÓN AQUÍ: USA getUser() ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/repartidor/home")}`);
  }

  // Ahora obtén el rol desde la base de datos para la máxima fiabilidad
  // igual que en el middleware.
  let role: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  role = (profile as any)?.role || null;

  // Opcional: Fallback a metadata si es necesario, pero la DB es la fuente de verdad.
  if (!role) {
    const am = (user.app_metadata as any) || {};
    const um = (user.user_metadata as any) || {};
    role = am.user_role || am.role || um.user_role || um.role || null;
  }

  // --- CONSISTENCIA DE ROLES ---
  // Asegúrate de que los nombres de roles sean consistentes.
  // En el middleware usas 'market', aquí usas 'aliado'. Usemos uno solo.
  const toHome = (r?: string | null) =>
    r === "admin"
      ? "/admin/dashboard"
      : r === "market" // Si usas 'market' en el middleware, úsalo aquí también
      ? "/partner/market/dashboard"
      : r === "delivery"
      ? "/repartidor/home"
      : "/user/home";

  if (role !== "delivery") {
    redirect(toHome(role));
  }

  return (
    <>
      <DeliveryHeader />
      <main className="bg-[#ECEFF0] min-h-screen">{children}</main>
    </>
  );
}

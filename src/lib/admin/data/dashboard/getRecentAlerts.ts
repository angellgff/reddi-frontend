import { createClient } from "@/src/lib/supabase/server";

export type AdminAlert = {
  type: "danger" | "warning" | "info";
  title: string;
  id: string;
};

function mapType(t: string): AdminAlert["type"] {
  const s = (t || "").toLowerCase();
  if (s.includes("error") || s.includes("delay") || s.includes("danger"))
    return "danger";
  if (s.includes("warn") || s.includes("inactive")) return "warning";
  return "info";
}

export default async function getRecentAlerts(
  limit = 5
): Promise<AdminAlert[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("title, type, id")
    .order("id", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as any[]).map((n) => ({
    type: mapType(n.type || ""),
    title: n.title || "Notificación",
    id: String(n.id),
  }));
}

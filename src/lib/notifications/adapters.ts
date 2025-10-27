import type { Tables } from "@/src/lib/database.types";

export type NotificationRow = Tables<"notifications">;

export type UINotification = {
  id: string; // UI uses string ids; convert numeric id to string
  type: "error" | "info" | "success";
  title: string;
  description: string;
  time: string; // human-friendly relative time
};

function relativeTime(fromIso: string): string {
  const from = new Date(fromIso);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - from.getTime()) / 1000);
  if (seconds < 60) return `Hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

export function toUINotification(row: NotificationRow): UINotification {
  // Normalize type into expected set
  const rawType = (row.type || "info").toLowerCase();
  const type: UINotification["type"] = ["error", "info", "success"].includes(
    rawType as any
  )
    ? (rawType as any)
    : "info";
  return {
    id: String(row.id),
    type,
    title: row.title,
    description: row.message,
    time: relativeTime(row.created_at),
  };
}

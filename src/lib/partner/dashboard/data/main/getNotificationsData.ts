import { createClient } from "@/src/lib/supabase/server";
import { toUINotification } from "@/src/lib/notifications/adapters";
import { Notification } from "@/src/lib/partner/dashboard/type";

export default async function getNotificationsData(): Promise<Notification[]> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10); // Limit to recent notifications

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  // Adapter transforms DB row to UI Notification type
  return (notifications || []).map(toUINotification);
}

"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/database.types";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string; // keep string; UI narrows to info|success|error
  metadata?: Json;
};

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_notification", {
    p_message: input.message,
    p_metadata: input.metadata ?? null,
    p_title: input.title,
    p_type: input.type,
    p_user_id: input.userId,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

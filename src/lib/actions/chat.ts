"use server";

import { createClient } from "@/src/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export type ChatSource = "regular" | "guest";

type NormalizedChatMessage = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
};

async function resolveChatSource(orderId: string): Promise<{
  source: ChatSource;
  guestOrderLinkId: string | null;
}> {
  const supabase = await createClient();

  const { data: guestMessages, error: guestMessagesError } = await supabase
    .from("guest_chat_messages")
    .select("guest_order_link_id")
    .eq("order_id", orderId)
    .limit(1);

  if (!guestMessagesError && guestMessages && guestMessages.length > 0) {
    return {
      source: "guest",
      guestOrderLinkId: guestMessages[0].guest_order_link_id,
    };
  }

  const { data: regularMessages, error: regularMessagesError } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (!regularMessagesError && regularMessages && regularMessages.length > 0) {
    return { source: "regular", guestOrderLinkId: null };
  }

  const { data: guestOrderLink, error } = await supabase
    .from("guest_order_links")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("[ServerAction] Error resolving chat source:", error);

    if (guestMessagesError) {
      console.error(
        "[ServerAction] Error checking guest_chat_messages for source resolution:",
        guestMessagesError,
      );
    }

    if (regularMessagesError) {
      console.error(
        "[ServerAction] Error checking chat_messages for source resolution:",
        regularMessagesError,
      );
    }

    return { source: "regular", guestOrderLinkId: null };
  }

  if (guestOrderLink?.id) {
    return { source: "guest", guestOrderLinkId: guestOrderLink.id };
  }

  return { source: "regular", guestOrderLinkId: null };
}

function normalizeGuestMessage(message: {
  id: string;
  order_id: string;
  sender_profile_id: string | null;
  content: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}): NormalizedChatMessage {
  return {
    id: message.id,
    order_id: message.order_id,
    sender_id: message.sender_profile_id ?? "guest",
    content: message.content,
    message_type: message.message_type,
    created_at: message.created_at,
    is_read: message.is_read,
  };
}

export async function getChatMessages(orderId: string) {
  const supabase = await createClient();
  const { source } = await resolveChatSource(orderId);

  try {
    if (source === "guest") {
      const { data, error } = await supabase
        .from("guest_chat_messages")
        .select(
          "id, order_id, sender_profile_id, content, message_type, created_at, is_read",
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(
          "[ServerAction] Error fetching guest chat messages:",
          error,
        );
        return { success: false, error: error.message };
      }

      const normalizedData = (data ?? []).map(normalizeGuestMessage);
      return { success: true, data: normalizedData, source };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[ServerAction] Error fetching chat messages:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data, source };
  } catch (error) {
    Sentry.captureException(error);
    console.error("[ServerAction] Exception fetching chat messages:", error);
    return { success: false, error: "Unknown error" };
  }
}

export async function checkSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

export async function sendMessage(
  orderId: string,
  content: string,
  messageType: "text" | "image" = "text",
) {
  const supabase = await createClient();
  const { source, guestOrderLinkId } = await resolveChatSource(orderId);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "No autorizado. Intenta recargar la página.",
    };
  }

  try {
    if (source === "guest") {
      if (!guestOrderLinkId) {
        return { success: false, error: "No se pudo resolver el chat guest." };
      }

      const { data, error } = await supabase
        .from("guest_chat_messages")
        .insert({
          guest_order_link_id: guestOrderLinkId,
          order_id: orderId,
          sender_profile_id: user.id,
          sender_role: "delivery",
          content,
          message_type: messageType,
          is_read: false,
          metadata: {},
        })
        .select(
          "id, order_id, sender_profile_id, content, message_type, created_at, is_read",
        )
        .single();

      if (error) {
        console.error("[ServerAction] Error sending guest message:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: normalizeGuestMessage(data), source };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        order_id: orderId,
        sender_id: user.id,
        content,
        message_type: messageType,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[ServerAction] Error sending message:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data, source };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[ServerAction] Exception sending message:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function uploadChatImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const orderId = formData.get("orderId") as string;

  if (!file || !orderId) {
    return { success: false, error: "Missing file or orderId" };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[ServerAction] Upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-images").getPublicUrl(fileName);

    return { success: true, publicUrl };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[ServerAction] Exception uploading image:", error);
    return { success: false, error: error.message };
  }
}

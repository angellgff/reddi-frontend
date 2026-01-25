"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getChatMessages(orderId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[ServerAction] Error fetching chat messages:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
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

    return { success: true, data };
  } catch (error: any) {
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
    console.error("[ServerAction] Exception uploading image:", error);
    return { success: false, error: error.message };
  }
}

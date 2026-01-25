"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, Send, Paperclip, Loader2, Phone, X } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type Database } from "@/src/lib/database.types";

type Message = Database["public"]["Tables"]["chat_messages"]["Row"];

interface UserChatProps {
  orderId: string;
  customerName: string;
  customerImage?: string | null;
  currentUserId: string;
  onClose: () => void;
}

export default function UserChat({
  orderId,
  customerName,
  customerImage,
  currentUserId,
  onClose,
}: UserChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages and subscribe
  useEffect(() => {
    let isMounted = true;
    console.log("[UserChat] Setting up chat for order:", orderId);

    const fetchMessages = async () => {
      console.log("[UserChat] Fetching messages for order:", orderId);
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at", { ascending: true });

        if (!isMounted) return;

        if (error) {
          console.error("[UserChat] Error fetching messages:", error);
        } else {
          console.log("[UserChat] Messages fetched:", data?.length || 0);
          if (data) setMessages(data);
        }
      } catch (err) {
        if (isMounted) console.error("[UserChat] Exception fetching messages:", err);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log("[UserChat] Incoming message payload:", payload);
          if (!isMounted) return;

          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        },
      )
      .subscribe((status) => {
        if (isMounted) console.log("[UserChat] Subscription status:", status);
      });

    return () => {
      isMounted = false;
      console.log("[UserChat] Unsubscribing from chat:", orderId);
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const handleSendMessage = async () => {
    console.log("[UserChat] Attempting to send message:", newMessage);
    if (!newMessage.trim()) {
      console.log("[UserChat] Empty message, skipping.");
      return;
    }

    const content = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    console.log("[UserChat] Inserting into DB:", {
      order_id: orderId,
      sender_id: currentUserId,
      content,
    });

    try {
      const { data: insertedData, error } = await supabase
        .from("chat_messages")
        .insert({
          order_id: orderId,
          sender_id: currentUserId,
          content: content,
          message_type: "text",
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("[UserChat] Error sending message:", error);
      } else {
        console.log("[UserChat] Message sent successfully. ID:", insertedData.id);
        // Optimistic update with deduplication check
        setMessages((prev) => {
            if (prev.some((msg) => msg.id === insertedData.id)) return prev;
            return [...prev, insertedData];
        });
      }
    } catch (err) {
      console.error("[UserChat] Exception sending message:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("[UserChat] No file selected.");
      return;
    }

    console.log("[UserChat] File selected:", file.name, file.size, file.type);
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${orderId}/${Date.now()}.${fileExt}`;

      console.log(
        "[UserChat] Uploading to storage bucket: chat-images, path:",
        fileName,
      );

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("[UserChat] Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-images").getPublicUrl(fileName);

      console.log("[UserChat] File uploaded. Public URL:", publicUrl);

      const { error: sendError } = await supabase.from("chat_messages").insert({
        order_id: orderId,
        sender_id: currentUserId,
        content: publicUrl,
        message_type: "image",
        is_read: false,
      });

      if (sendError) {
        console.error("[UserChat] Error inserting image message:", sendError);
        throw sendError;
      }

      console.log("[UserChat] Image message sent successfully.");
    } catch (error) {
      console.error("[UserChat] Exception during image upload/send:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Group messages logic here if needed (e.g. consecutive messages from same user)

  return (
    <div className="fixed inset-0 bg-[#F6F6F6] z-[100] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-[#04BD88] pt-safe px-4 pb-4">
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
              {customerImage ? (
                <Image
                  src={customerImage}
                  alt={customerName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-white">
                  {customerName.charAt(0)}
                </div>
              )}
              {/* Online indicator placeholder */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-white">
              <div className="font-semibold text-base leading-tight">
                {customerName}
              </div>
              <div className="text-white/80 text-xs">Cliente</div>
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white">
            <Phone size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F6F6F6]">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isImage = msg.message_type === "image";

          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
              >
                {/* Message Bubble */}
                <div
                  className={`relative px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-[#595959] text-white rounded-t-lg rounded-bl-lg"
                      : "bg-white text-[#363D4E] rounded-t-lg rounded-br-lg"
                  }`}
                >
                  {isImage ? (
                    <div 
                      className="relative w-48 h-48 rounded-md overflow-hidden bg-black/10 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setViewingImage(msg.content)}
                    >
                      <Image
                        src={msg.content}
                        alt="Image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  )}

                  {/* Metadata / Time */}
                  <div
                    className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                      isMe ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {format(new Date(msg.created_at), "h:mm a", { locale: es })}
                    {isMe && (
                      <span>
                        {/* Simple checks for read/sent could go here */}
                        {msg.is_read ? (
                          <span className="text-blue-300">✓✓</span>
                        ) : (
                          <span>✓</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Tail Decorations (Optional, pure CSS or SVG can be used) */}
                  {/* Simplified tail effect via border radius */}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 pb-8 border-t border-gray-100">
        <div className="flex items-center gap-3 bg-[#F4F5F7] rounded-lg px-3 py-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm h-10"
          />

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim()
                ? "bg-[#04BD88] text-white shadow-md active:scale-95"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      {/* Image Preview Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-95 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image
              src={viewingImage}
              alt="Full size"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-6 right-6 z-[120] p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}


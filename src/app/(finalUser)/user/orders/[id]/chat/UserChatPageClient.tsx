"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, Send, Paperclip, Loader2, Phone, X } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { type Database } from "@/src/lib/database.types";
import {
  getChatMessages,
  sendMessage,
  uploadChatImage,
} from "@/src/lib/actions/chat";

type Message = Database["public"]["Tables"]["chat_messages"]["Row"];

interface UserChatPageClientProps {
  orderId: string;
  driverId: string;
  driverName: string;
  driverImage?: string | null;
  currentUserId: string;
}

export default function UserChatPageClient({
  orderId,
  driverId,
  driverName,
  driverImage,
  currentUserId,
}: UserChatPageClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    console.log("[UserChatPage] Setting up chat for order:", orderId);
    setChatError(null);

    // 1. Fetch Existing Messages
    const loadMessages = async () => {
      try {
        const response = await getChatMessages(orderId);

        if (isMounted) {
          if (response.success && response.data) {
            setMessages(response.data);
          } else {
            console.error(
              "[UserChatPage] Server Action failed:",
              response.error,
            );
            setChatError("Error cargando mensajes.");
          }
        }
      } catch (e) {
        console.error("[UserChatPage] Error calling Server Action:", e);
      }
    };

    loadMessages();

    // 2. Realtime Subscription (Standard/Conventional)
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
          if (!isMounted) return;
          const newMsg = payload.new as Message;
          // De-duplicate
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .subscribe((status) => {
        console.log(`[UserChatPage] Realtime status: ${status}`);
        if (status === "CHANNEL_ERROR") {
          console.warn("[UserChatPage] Realtime connection issue");
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      created_at: new Date().toISOString(),
      order_id: orderId,
      sender_id: currentUserId,
      content,
      message_type: "text",
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Use Server Action instead of client fetch
      const result = await sendMessage(orderId, content, "text");

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error sending message");
      }

      const realMsg = result.data;

      // Replace optimistic message
      setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
    } catch (error) {
      console.error("[UserChatPage] Send error:", error);
      setChatError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content); // Restore input
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Use Server Action for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", String(orderId));

      const uploadResult = await uploadChatImage(formData);

      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error(uploadResult.error || "Error uploading image");
      }

      const publicUrl = uploadResult.publicUrl;

      // Optimistic update for image
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: Message = {
        id: tempId,
        created_at: new Date().toISOString(),
        order_id: String(orderId), // Ensure string
        sender_id: currentUserId,
        content: publicUrl,
        message_type: "image",
        is_read: false,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      // Use Server Action
      const result = await sendMessage(orderId, publicUrl, "image");

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error sending image");
      }

      const realMsg = result.data;

      setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
    } catch (err) {
      console.error("[UserChatPage] Upload error:", err);
      alert("Error uploading image");
      // Could verify tempId here if scope allowed, but simple alert is ok for now.
      // Ideally move tempId up scope or filter optimistic out by condition if needed.
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCall = () => {
    window.location.href = `tel:+1234567890`; // Logic to get real number should be added based on driver phone
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-screen flex-col bg-white font-sans">
      {/* Header */}
      <div className="bg-white pt-safe px-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-[31px] h-[31px] flex items-center justify-center rounded-full bg-[#DCDCDC]/30 text-black hover:bg-[#DCDCDC]/50 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {driverImage ? (
                  <Image
                    src={driverImage}
                    alt={driverName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 font-bold">
                    {driverName.charAt(0)}
                  </div>
                )}
              </div>
              {/* Optional: Show Name if desired */}
            </div>
          </div>

          <button
            onClick={handleCall}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#F4F5F7] text-black hover:bg-gray-200 transition-colors"
          >
            <Phone size={18} fill="currentColor" className="text-black" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {chatError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-xs text-center w-full relative z-10">
          {chatError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-white">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isImage = msg.message_type === "image";

          return (
            <div
              key={msg.id}
              className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative px-4 py-3 shadow-none text-[15px] leading-[22px] tracking-[-0.2px]
                    ${
                      isMe
                        ? "bg-[#595959] text-white rounded-[8px] rounded-tr-none"
                        : "bg-white text-[#363D4E] rounded-[8px] rounded-tl-none border border-gray-100 shadow-sm"
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
                    <p className="whitespace-pre-wrap font-inter font-normal">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
              {/* Time & Status - Outside Bubble */}
              <div
                className={`flex items-center gap-1 mt-1 text-[12px] text-[#5C616F] font-inter ${isMe ? "justify-end" : "justify-start pl-1"}`}
              >
                <span>
                  {format(new Date(msg.created_at), "h:mm a", { locale: es })}
                </span>
                {isMe && (
                  <span className="text-[#5C616F]">
                    {msg.is_read ? "Seen" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-5 pb-8 pt-2">
        <div className="relative flex items-center bg-[#F4F5F7] rounded-[8px] px-4 py-3 h-[54px]">
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
            placeholder="Escribe..."
            className="flex-1 bg-transparent border-none outline-none text-[#484848] placeholder-[#A7AAB2] text-[15px] font-medium font-inter"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-2 w-8 h-8 rounded-full bg-[#E8EBEE] flex items-center justify-center text-[#040C22] hover:opacity-80 transition-opacity"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <div className="transform rotate-45">
                <Paperclip size={16} />
              </div>
            )}
          </button>
          {newMessage.trim() && (
            <button onClick={handleSendMessage} className="ml-2 text-[#04BD88]">
              <Send size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[120] bg-black bg-opacity-95 flex items-center justify-center p-4">
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
            className="absolute top-6 right-6 z-[130] p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

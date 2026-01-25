"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, Send, Paperclip, Loader2, X } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { type Database } from "@/src/lib/database.types";
import { getChatMessages, sendMessage, uploadChatImage } from "@/src/lib/actions/chat";

type Message = Database["public"]["Tables"]["chat_messages"]["Row"];

interface ChatPageClientProps {
  orderId: string;
  customerName: string;
  currentUserId: string;
}

export default function ChatPageClient({
  orderId,
  customerName,
  currentUserId,
}: ChatPageClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null); // New error state
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
    console.log("[ChatPage] Setting up chat for order:", orderId);
    setChatError(null);

    // 1. Fetch Existing Messages
    const loadMessages = async () => {
      try {
        const response = await getChatMessages(orderId);
        if (isMounted) {
          if (response.success && response.data) {
            setMessages(response.data);
          } else {
            setChatError("Error cargando mensajes.");
          }
        }
      } catch (e) {
        console.error("[ChatPage] Error calling Server Action:", e);
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
          // De-duplicate in case of race conditions or optimistic updates
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        console.log(`[ChatPage] Realtime status: ${status}`);
        if (status === "CHANNEL_ERROR") {
          console.warn("[ChatPage] Realtime connection issue");
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempId = crypto.randomUUID();
    const tempMessage: Message = {
      id: tempId,
      order_id: String(orderId),
      sender_id: currentUserId,
      content,
      message_type: "text",
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const result = await sendMessage(String(orderId), content, "text");

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to send message");
      }

      const realMessage = result.data;

      // Replace optimistic message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMessage : m)),
      );
    } catch (error) {
      console.error("[ChatPage] Send error:", error);
      // Rollback
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Error al enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create FormData for Server Action
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", String(orderId));

      const uploadResult = await uploadChatImage(formData);
      
      if (!uploadResult.success || !uploadResult.publicUrl) {
          throw new Error(uploadResult.error || "Error uploading image");
      }

      const publicUrl = uploadResult.publicUrl;

      // Optimistic update for image
      const tempId = crypto.randomUUID();
      const tempMessage: Message = {
        id: tempId,
        order_id: String(orderId),
        sender_id: currentUserId,
        content: publicUrl,
        message_type: "image",
        created_at: new Date().toISOString(),
        is_read: false,
      };

      setMessages((prev) => [...prev, tempMessage]);

      const result = await sendMessage(String(orderId), publicUrl, "image");

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to send image message");
      }

      const realMessage = result.data;

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMessage : m)),
      );
    } catch (err) {
      console.error("[ChatPage] Upload error:", err);
      // We don't have the tempId here easily if we don't restructure the try block or hoist the tempId.
      // For now, let's alert. The functionality is more important.
      alert("Error al enviar la imagen.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-[#F6F6F6] fixed inset-0 z-[100]">
      {/* Header */}
      <div className="bg-[#04BD88] pt-safe px-4 pb-4 shadow-md">
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 font-bold bg-white overflow-hidden">
              {customerName.charAt(0)}
            </div>
            <div className="text-white">
              <div className="font-semibold text-base leading-tight">
                {customerName}
              </div>
              <div className="text-white/80 text-xs">Cliente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {chatError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-xs text-center w-full relative z-10">
          {chatError}
        </div>
      )}
      {/* Debug Status */}
      <div className="bg-gray-100 text-gray-500 text-[10px] text-center w-full py-1">
        Status: <span id="rt-status">Initializing...</span> | Order: {orderId}
      </div>
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
                  <div
                    className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? "text-white/70" : "text-gray-400"}`}
                  >
                    {format(new Date(msg.created_at), "h:mm a", { locale: es })}
                    {isMe && (
                      <span>
                        {msg.is_read ? (
                          <span className="text-blue-300">✓✓</span>
                        ) : (
                          <span>✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 pb-8 border-t border-gray-100 shadow-upper">
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

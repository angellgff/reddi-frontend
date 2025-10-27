"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { Database, Tables, Session } from "@/src/lib/database.types";

// Types based on DB schema
export type NotificationRow = Tables<"notifications">;

export type NotificationsContextValue = {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: NotificationRow["id"]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addLocal: (n: NotificationRow) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  return ctx;
};

type Props = {
  children: React.ReactNode;
  initialLimit?: number;
};

export function NotificationsProvider({ children, initialLimit = 50 }: Props) {
  // Usamos createClient() directamente, ya que el hook lo memoriza internamente
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Correcto, inicia en true
  const [error, setError] = useState<string | null>(null);

  // Ref para el usuario actual y el canal de realtime
  const userIdRef = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // CAMBIO CLAVE 1: La función de carga ahora es más simple.
  // Ya no necesita obtener el usuario, lo recibe como parámetro.
  const fetchData = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setNotifications([]);
        userIdRef.current = null;
        setLoading(false); // Aseguramos que el loading termine si no hay usuario
        return;
      }

      // Si el usuario no ha cambiado, no necesitamos recargar todo
      if (userId === userIdRef.current && notifications.length > 0) {
        return;
      }

      userIdRef.current = userId;
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchErr } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(initialLimit);

        if (fetchErr) throw fetchErr;

        setNotifications((data ?? []) as NotificationRow[]);
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar notificaciones");
        setNotifications([]); // Limpiar en caso de error
      } finally {
        // Esto se ejecutará siempre, resolviendo el problema
        setLoading(false);
      }
    },
    [initialLimit, supabase, notifications.length]
  );

  const setupRealtime = useCallback(
    (userId: string | null) => {
      // Limpiar canal anterior si existe
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      if (!userId) return;

      const channel = supabase
        .channel(`notifications-realtime-for-${userId}`)
        .on<NotificationRow>(
          "postgres_changes",
          {
            event: "*", // Escuchamos INSERT y UPDATE
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setNotifications((prev) => [payload.new, ...prev]);
            }
            if (payload.eventType === "UPDATE") {
              setNotifications((prev) =>
                prev.map((n) => (n.id === payload.new.id ? payload.new : n))
              );
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    },
    [supabase]
  );

  // CAMBIO CLAVE 2: useEffect simplificado. Usamos SÓLO onAuthStateChange.
  useEffect(() => {
    // onAuthStateChange se dispara al cargar con la sesión inicial.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userId = session?.user?.id ?? null;
        await fetchData(userId);
        setupRealtime(userId);
      }
    );

    return () => {
      // Limpieza al desmontar el componente
      authListener.subscription.unsubscribe();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
    // Las dependencias son estables, por lo que esto se ejecuta solo una vez.
  }, [supabase, fetchData, setupRealtime]);

  // Las funciones de `markAsRead` y `markAllAsRead` son correctas y pueden permanecer como están.
  const markAsRead = useCallback(
    async (id: NotificationRow["id"]) => {
      // ... tu código existente
    },
    [supabase]
  );

  const markAllAsRead = useCallback(async () => {
    // ... tu código existente
  }, [supabase, fetchData]);

  const addLocal = useCallback((n: NotificationRow) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refresh: () => fetchData(userIdRef.current), // Refresh ahora usa el ID guardado
      markAsRead,
      markAllAsRead,
      addLocal,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      fetchData,
      markAsRead,
      markAllAsRead,
      addLocal,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/database.types";

export type UserAddress = Tables<"user_addresses">; // Row shape

export function useUserAddresses() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("useUserAddresses hook invoked");

  useEffect(() => {
    // Para identificar cada ejecución del hook en la consola
    const hookInstanceId = Date.now();
    console.groupCollapsed(
      `[useUserAddresses #${hookInstanceId}] Hook effect triggered`
    );

    let cancelled = false;

    const load = async () => {
      try {
        console.log(
          `[useUserAddresses #${hookInstanceId}] 1. Starting address load...`
        );
        setLoading(true);
        setError(null);

        const supabase = createClient();
        console.log(
          `[useUserAddresses #${hookInstanceId}] 2. Checking user authentication...`
        );
        const { data: auth, error: authError } = await supabase.auth.getUser();

        // Loguear si hubo un error al obtener el usuario
        if (authError) {
          console.error(
            `[useUserAddresses #${hookInstanceId}] Auth Error:`,
            authError
          );
        }

        if (!auth.user) {
          console.warn(
            `[useUserAddresses #${hookInstanceId}] 3. No authenticated user found. Clearing addresses.`
          );
          setAddresses([]);
          // No es necesario continuar si no hay usuario
          return;
        }

        console.log(
          `[useUserAddresses #${hookInstanceId}] 3. User found. ID: ${auth.user.id}`
        );
        console.log(
          `[useUserAddresses #${hookInstanceId}] 4. Fetching addresses from Supabase for this user...`
        );

        const { data, error: queryError } = await supabase
          .from("user_addresses")
          .select("id, location_type, location_number, created_at, user_id")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false });

        // Loguear siempre el resultado de la consulta para ver qué devuelve Supabase
        console.log(
          `[useUserAddresses #${hookInstanceId}] 5. Supabase response:`,
          { data, queryError }
        );

        if (queryError) {
          // Si Supabase devuelve un error, lo lanzamos para que lo capture el catch
          throw queryError;
        }

        if (!cancelled) {
          console.log(
            `[useUserAddresses #${hookInstanceId}] 6. Success! Setting ${
              data?.length || 0
            } addresses to state.`
          );
          setAddresses((data as UserAddress[]) || []);
        } else {
          console.log(
            `[useUserAddresses #${hookInstanceId}] 6. Component unmounted before setting state. Aborting.`
          );
        }
      } catch (e: any) {
        console.error(
          `[useUserAddresses #${hookInstanceId}] 💥 An error occurred:`,
          e
        );
        if (!cancelled) {
          setError(e?.message || "Error al cargar direcciones");
        } else {
          console.warn(
            `[useUserAddresses #${hookInstanceId}] 💥 Error occurred, but component was unmounted. Not setting error state.`
          );
        }
      } finally {
        if (!cancelled) {
          console.log(
            `[useUserAddresses #${hookInstanceId}] 7. Finished. Setting loading to false.`
          );
          setLoading(false);
        } else {
          console.log(
            `[useUserAddresses #${hookInstanceId}] 7. Finished, but component was unmounted. Not setting loading state.`
          );
        }
        console.groupEnd(); // Cierra el grupo de logs para esta ejecución
      }
    };

    load();

    return () => {
      console.log(
        `[useUserAddresses #${hookInstanceId}] 🧹 Cleanup: Component is unmounting. Setting cancelled = true.`
      );
      cancelled = true;
      console.groupEnd(); // Asegurarse de cerrar el grupo si se desmonta antes de finalizar
    };
  }, []);

  return { addresses, loading, error, setAddresses } as const;
}

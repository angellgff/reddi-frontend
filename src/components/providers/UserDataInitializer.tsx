"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { fetchUserAddresses } from "@/src/lib/store/addressSlice";

/**
 * Este componente no renderiza UI. Su único propósito es asegurar que los datos
 * esenciales del usuario (como direcciones) se carguen una sola vez al montar
 * el layout principal del usuario, evitando race conditions en componentes hijos.
 */
export default function UserDataInitializer() {
  const dispatch = useAppDispatch();
  const addressStatus = useAppSelector((s) => s.addresses.status);

  useEffect(() => {
    // Si las direcciones nunca se han cargado (estado 'idle'), las pedimos.
    // Si ya están 'loading' o 'succeeded', no hacemos nada.
    if (addressStatus === "idle") {
      dispatch(fetchUserAddresses());
    }
  }, [addressStatus, dispatch]);

  // Podrías añadir aquí la lógica para otros datos globales si es necesario.

  return null; // No renderiza nada en el DOM.
}

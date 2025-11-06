// src/lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // Quita el '!' temporalmente
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY; // Quita el '!' temporalmente

  console.log("Supabase URL desde client.ts:", url); // <-- AÑADE ESTO
  console.log("Supabase Key desde client.ts:", key); // <-- AÑADE ESTO

  if (!url || !key) {
    throw new Error(
      "Supabase URL o Key no están definidas en las variables de entorno del cliente."
    );
  }

  return createBrowserClient(url, key);
}

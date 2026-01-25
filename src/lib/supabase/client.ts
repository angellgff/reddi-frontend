import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function createClient() {
  if (client) {
    if (typeof window !== "undefined") {
      // console.log("🟢 [Supabase] Returning existing singleton client");
    }
    return client;
  }

  if (typeof window !== "undefined") {
    console.log("🔵 [Supabase] Creating NEW browser client instance");
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  return client;
}

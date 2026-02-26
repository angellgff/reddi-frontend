import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
let hasAttachedAuthDeduplication = false;

function attachAuthReadDeduplication(supabaseClient: SupabaseClient) {
  if (hasAttachedAuthDeduplication) return;

  const auth = supabaseClient.auth as any;
  const originalGetUser = auth.getUser.bind(auth);
  const originalGetSession = auth.getSession.bind(auth);

  let cachedUserResult: Awaited<ReturnType<typeof originalGetUser>> | null =
    null;
  let cachedSessionResult: Awaited<
    ReturnType<typeof originalGetSession>
  > | null = null;
  let inFlightGetUser: Promise<
    Awaited<ReturnType<typeof originalGetUser>>
  > | null = null;
  let inFlightGetSession: Promise<
    Awaited<ReturnType<typeof originalGetSession>>
  > | null = null;

  const invalidateReads = () => {
    cachedUserResult = null;
    cachedSessionResult = null;
    inFlightGetUser = null;
    inFlightGetSession = null;
  };

  auth.getUser = (...args: any[]) => {
    if (args.length > 0) {
      return originalGetUser(...args);
    }

    if (cachedUserResult) {
      return Promise.resolve(cachedUserResult);
    }

    if (!inFlightGetUser) {
      inFlightGetUser = originalGetUser()
        .then((result: Awaited<ReturnType<typeof originalGetUser>>) => {
          cachedUserResult = result;
          return result;
        })
        .finally(() => {
          inFlightGetUser = null;
        });
    }

    return inFlightGetUser;
  };

  auth.getSession = (...args: any[]) => {
    if (args.length > 0) {
      return originalGetSession(...args);
    }

    if (cachedSessionResult) {
      return Promise.resolve(cachedSessionResult);
    }

    if (!inFlightGetSession) {
      inFlightGetSession = originalGetSession()
        .then((result: Awaited<ReturnType<typeof originalGetSession>>) => {
          cachedSessionResult = result;
          return result;
        })
        .finally(() => {
          inFlightGetSession = null;
        });
    }

    return inFlightGetSession;
  };

  const mutationMethods = [
    "signOut",
    "signInWithPassword",
    "signInWithOtp",
    "signInAnonymously",
    "signInWithOAuth",
    "signUp",
    "setSession",
    "refreshSession",
    "verifyOtp",
    "exchangeCodeForSession",
    "updateUser",
    "resetPasswordForEmail",
  ];

  for (const methodName of mutationMethods) {
    const originalMethod = auth[methodName];
    if (typeof originalMethod !== "function") continue;

    auth[methodName] = async (...args: any[]) => {
      invalidateReads();
      const result = await originalMethod.apply(auth, args);
      invalidateReads();
      return result;
    };
  }

  supabaseClient.auth.onAuthStateChange(() => {
    invalidateReads();
  });

  hasAttachedAuthDeduplication = true;
}

export function createClient() {
  if (client) {
    if (typeof window !== "undefined") {
      // console.log("🟢 [Supabase] Returning existing singleton client");
    }
    attachAuthReadDeduplication(client);
    return client;
  }

  if (typeof window !== "undefined") {
    console.log("🔵 [Supabase] Creating NEW browser client instance");
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );

  attachAuthReadDeduplication(client);

  return client;
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

const serverClientCache = new WeakMap<object, SupabaseClient>();

function attachAuthReadDeduplication(client: SupabaseClient) {
  const auth = client.auth as any;

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
}

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const cacheKey = cookieStore as unknown as object;
  const cachedClient = serverClientCache.get(cacheKey);

  if (cachedClient) {
    return cachedClient;
  }

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  attachAuthReadDeduplication(client as SupabaseClient);
  serverClientCache.set(cacheKey, client as SupabaseClient);

  return client;
}

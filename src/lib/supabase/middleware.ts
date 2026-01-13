import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type User } from "@supabase/supabase-js";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(
    `\n\n--- [MW-DEBUG] INICIO Petición a: ${request.method} ${path} ---`
  );

  // Helper: create a redirect response and propagate any cookies Supabase asked us to set
  function redirectWithCookies(target: URL, base: NextResponse) {
    const res = NextResponse.redirect(target);
    base.cookies.getAll().forEach(({ name, value }) => {
      res.cookies.set(name, value);
    });
    console.log(`[MW-DEBUG] 🚀 Redirigiendo a: ${target.href}`);
    return res;
  }
  function getHomeUrlForRole(role: string | null): string {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "market":
        return "/partner/market/dashboard";
      case "restaurant":
        return "/partner/restaurant/dashboard";
      case "delivery":
        return "/repartidor/home";
      case "user":
      default:
        return "/user/home";
    }
  }

  // 1. Crear una respuesta base
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Crear el cliente de Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Obtener la sesión del usuario
  const withTimeout = async <T>(
    p: Promise<T> | PromiseLike<T>,
    ms: number
  ): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("auth-timeout")), ms)
      ),
    ]);
  };

  let user: User | null = null;
  try {
    const {
      data: { user: u },
    } = await withTimeout(supabase.auth.getUser(), 1200);
    user = u || null;
  } catch (e) {
    console.warn(
      "[MW-DEBUG] Error o timeout en getUser:",
      (e as Error)?.message
    );
  }

  const isAuthed = !!user;

  // --- GLOBALS ---
  const isStaticAsset = path.match(
    /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/
  );

  // --- EMAIL VERIFICATION CHECK ---
  if (isAuthed && !user?.email_confirmed_at) {
    // Allows access to verify-email, auth endpoints, callback, sign-out, etc.
    // Blocks access to core app routes if email is not confirmed
    const isAuthRoute =
      path.startsWith("/auth") || path.startsWith("/api/auth");

    if (!isAuthRoute && !isStaticAsset) {
      console.log(`[MW] Usuario no verificado redirigido a /auth/verify-email`);
      return redirectWithCookies(
        new URL(
          `/auth/verify-email?email=${encodeURIComponent(user?.email || "")}`,
          request.url
        ),
        supabaseResponse
      );
    }
  }

  // const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes("auth")); // Ya no es necesario para la lógica principal

  // --- GLOBAL ONBOARDING CHECK ---
  // Must be done before ANY other redirect to ensure it is seen "en todas las rutas".
  // Except API, Assets, and /onboarding itself.

  // const isStaticAsset = path.match(
  //   /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|json|woff|woff2|ttf)$/i
  // );
  const onboardingSeenCookie = request.cookies.get("onboarding_seen");
  let hasCompletedOnboardingGlobal = !!onboardingSeenCookie;

  // Sync from DB if user is logged in but cookie is missing
  if (user && !hasCompletedOnboardingGlobal) {
    const am = (user?.app_metadata as Record<string, unknown>) || {};
    const um = (user?.user_metadata as Record<string, unknown>) || {};
    const dbOnboarding = um.onboarding_completed || am.onboarding_completed;
    if (dbOnboarding) {
      hasCompletedOnboardingGlobal = true;
      supabaseResponse.cookies.set("onboarding_seen", "true", {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  if (
    !hasCompletedOnboardingGlobal &&
    !path.startsWith("/api/") &&
    !path.startsWith("/_next/") &&
    path !== "/onboarding" &&
    !isStaticAsset
  ) {
    console.log(
      "[MW-DEBUG] Global Check: Usuario no ha visto onboarding. Redirigiendo a /onboarding"
    );
    const nextUrl = new URL("/onboarding", request.url);
    nextUrl.searchParams.set("next", path + (request.nextUrl.search || ""));
    return redirectWithCookies(nextUrl, supabaseResponse);
  }
  // --- END GLOBAL ONBOARDING CHECK ---

  let role: string | null = null;
  if (user) {
    try {
      const result = await withTimeout(
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        1000
      );
      const profile = result.data;
      role = profile?.role ?? null;
    } catch (e) {
      const am = (user?.app_metadata as Record<string, unknown>) || {};
      const um = (user?.user_metadata as Record<string, unknown>) || {};
      role =
        (am.user_role as string) ||
        (am.role as string) ||
        (um.user_role as string) ||
        (um.role as string) ||
        null;
      console.warn(
        "[MW-DEBUG] Fallo al buscar rol en 'profiles', usando metadata:",
        (e as Error)?.message
      );
    }
  }

  console.log(
    `[MW-DEBUG] Estado de autenticación: isAuthed=${isAuthed}, role=${role}`
  );

  // 4. Definir rutas públicas y de autenticación
  const publicPaths = [
    "/",
    "/login",
    "/registro",
    "/registro/celular",
    "/admin/login",
    "/partner/login",
    "/partner/registro",
    "/politica-entrega",
    "/politica-reembolsos-devoluciones-cancelaciones",
    "/terminos-y-condiciones",
    "/contact-information",
    "/privacidad",
    "/protocolo-respuesta-incidentes-irp",
    "/politicas-seguridad-transmision-datos-tarjetas",
    "/auth/callback",
    "/productos-y-servicios",
  ];
  const authPaths = [
    "/login",
    "/registro",
    "/registro/celular",
    "/admin/login",
    "/partner/login",
    "/partner/registro",
    "/auth/callback",
    "/productos-y-servicios",
  ];

  const isPublicPath = publicPaths.includes(path);
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  console.log(
    `[MW-DEBUG] Análisis de ruta: isPublicPath=${isPublicPath}, isAuthPath=${isAuthPath}`
  );

  // --- LÓGICA DE REDIRECCIÓN ---

  // 5. Lógica para usuarios YA AUTENTICADOS
  if (isAuthed) {
    console.log("[MW-DEBUG] Analizando lógica para usuario AUTENTICADO.");

    // --- Onboarding Check ---
    // const isStaticAsset = path.match(
    //   /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|json|woff|woff2|ttf)$/i
    // );
    const onboardingSeenCookie = request.cookies.get("onboarding_seen");
    let hasCompletedOnboarding = !!onboardingSeenCookie;

    if (!hasCompletedOnboarding && user) {
      // Fallback: check DB if user is logged in
      const am = (user?.app_metadata as Record<string, unknown>) || {};
      const um = (user?.user_metadata as Record<string, unknown>) || {};
      // Check both locations just in case
      const dbOnboarding = um.onboarding_completed || am.onboarding_completed;
      if (dbOnboarding) {
        hasCompletedOnboarding = true;
        // Sync cookie for future requests to avoid DB check overhead if possible,
        // though here we are already checking user for other reasons.
        // We can set the cookie on the response so next time it is faster/consistent.
        supabaseResponse.cookies.set("onboarding_seen", "true", {
          maxAge: 60 * 60 * 24 * 365,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }
    }

    if (
      !hasCompletedOnboarding &&
      !path.startsWith("/api/") &&
      !path.startsWith("/_next/") &&
      path !== "/onboarding" &&
      !isStaticAsset // This refers to the top helper const now
    ) {
      console.log(
        "[MW-DEBUG] Usuario no ha completado onboarding. Redirigiendo a /onboarding"
      );
      const nextUrl = new URL("/onboarding", request.url);
      if (path !== "/") {
        nextUrl.searchParams.set("next", path);
        if (request.nextUrl.search) {
          // Append original search params to next? Or just let the component handle simple return?
          // Simple return to path + search is handled by letting the component navigate to it.
          // We just need to pass the full relative path as 'next'.
          nextUrl.searchParams.set("next", path + request.nextUrl.search);
        }
      } else {
        nextUrl.searchParams.set("next", "/");
      }
      return redirectWithCookies(nextUrl, supabaseResponse);
    }

    if (isAuthPath || path === "/") {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] Usuario autenticado en ruta pública/auth ('${path}'). Redirigiendo a su home: ${homeUrl}`
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    }

    // --- Control de acceso basado en roles (sin cambios) ---
    // ... (El resto de la lógica de roles permanece igual)
    const denyAccessAndRedirect = (reason: string) => {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] ACCESO DENEGADO: ${reason}. Rol: '${role}', Path: '${path}'. Redirigiendo a: ${homeUrl}`
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    };

    if (path.startsWith("/admin") && role !== "admin") {
      return denyAccessAndRedirect("Área de admin requiere rol 'admin'");
    }
    if (path.startsWith("/partner/market") && role !== "market") {
      return denyAccessAndRedirect(
        "Área de Partner Market requiere rol 'market'"
      );
    }
    if (path.startsWith("/partner/restaurant") && role !== "restaurant") {
      return denyAccessAndRedirect(
        "Área de Partner Restaurant requiere rol 'restaurant'"
      );
    }
    if (path.startsWith("/repartidor") && role !== "delivery") {
      return denyAccessAndRedirect(
        "Área de Repartidor requiere rol 'delivery'"
      );
    }
    if (role && path.startsWith("/user")) {
      const specialRoles = ["admin", "market", "restaurant", "delivery"];
      if (specialRoles.includes(role as string)) {
        return denyAccessAndRedirect(
          "Roles especiales no pueden acceder al área de usuario general"
        );
      }
    }
    if (path.startsWith("/aliado")) {
      const base =
        role === "restaurant" ? "/partner/restaurant" : "/partner/market";
      const sub = path.replace(/^\/aliado/, "");
      const targetPath =
        sub && sub !== "" ? `${base}${sub}` : `${base}/dashboard`;
      const target = new URL(targetPath, request.url);
      target.search = request.nextUrl.search;
      console.log(
        `[MW-DEBUG] Redirigiendo ruta legacy '/aliado' a -> ${target.pathname}`
      );
      return redirectWithCookies(target, supabaseResponse);
    }
    if (path === "/partner" || path === "/partner/") {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] Usuario partner en ruta genérica '/partner'. Redirigiendo a su home: ${homeUrl}`
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    }
  }

  // 5b. Lógica para cookie existente pero sesión no resuelta (timeout)
  // Se comenta este bloque para basar la decisión únicamente en la sesión real (isAuthed)
  // y no en la mera existencia de una cookie. Esto evita bucles de redirección con
  // cookies expiradas o inválidas.
  /*
  if (!isAuthed && hasAuthCookie && path === "/") {
    console.log("[MW-DEBUG] ¡Caso especial! Cookie de auth existe pero no se resolvió el usuario (timeout). Redirigiendo desde '/' para evitar página pública.");
    const homeUrl = getHomeUrlForRole(role); // role es null -> /user/home
    return redirectWithCookies(new URL(homeUrl, request.url), supabaseResponse);
  }
  */

  // 6. Lógica para usuarios NO AUTENTICADOS
  if (!isAuthed && !isPublicPath) {
    // 7. Si ninguna regla se aplicó, permite el acceso

    // Last check for Public Paths for Unauthenticated users who missed the check above because they were hitting a public path?
    // Wait, if I hit /login (public path), loop 6 is skipped.
    // I need a global check for onboarding regardless of auth status.

    console.log(
      `[MW-DEBUG] ✅ Acceso permitido a: ${path}. No se aplicó ninguna regla de redirección.`
    );
    return supabaseResponse;
  }

  return supabaseResponse;
}

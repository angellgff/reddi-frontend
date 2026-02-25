import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type User } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(
    `\n\n--- [MW-DEBUG] INICIO Petición a: ${request.method} ${path} ---`,
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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. Obtener la sesión del usuario
  const withTimeout = async <T>(
    p: Promise<T> | PromiseLike<T>,
    ms: number,
  ): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("auth-timeout")), ms),
      ),
    ]);
  };

  let user: User | null = null;
  try {
    const {
      data: { user: u },
    } = await withTimeout(supabase.auth.getUser(), 10000);
    user = u || null;
  } catch (e) {
    Sentry.captureException(e);
    console.warn(
      "[MW-DEBUG] Error o timeout en getUser:",
      (e as Error)?.message,
    );
  }

  const isAuthed = !!user;

  // --- GLOBALS ---
  const isStaticAsset = path.match(
    /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|map)$/,
  );

  // --- EMAIL VERIFICATION CHECK (DISABLED) ---
  /*
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
          request.url,
        ),
        supabaseResponse,
      );
    }
  }
  */

  // --- PHONE VERIFICATION CHECK ---
  // Bloquea el acceso si el usuario tiene teléfono registrado pero no confirmado.
  const userPhone = user?.phone || (user?.user_metadata as any)?.phone_number;
  // Check both standard field and metadata flag for verification status
  const isPhoneVerified =
    !!user?.phone_confirmed_at ||
    (user?.user_metadata as any)?.phone_verified === true;

  if (isAuthed) {
    console.log(`[MW-DEBUG] Phone Check for user ${user?.id}:
      - user.phone: '${user?.phone}'
      - metadata.phone_number: '${(user?.user_metadata as any)?.phone_number}'
      - phone_confirmed_at: ${user?.phone_confirmed_at}
      - metadata.phone_verified: ${(user?.user_metadata as any)?.phone_verified}
      - Resolved userPhone: '${userPhone}'
      - Resolved isPhoneVerified: ${isPhoneVerified}
    `);
  }

  if (isAuthed && userPhone && !isPhoneVerified) {
    const isVerifyOtpPage = path === "/auth/verify-otp";
    const isApiAuth = path.startsWith("/api/auth");

    console.log(`[MW-DEBUG] Entering Phone Check Logic:
      - isVerifyOtpPage: ${isVerifyOtpPage}
      - isApiAuth: ${isApiAuth}
      - isStaticAsset: ${!!isStaticAsset}
    `);

    // Permitir acceso a:
    // 1. La propia página de verificación
    // 2. Endpoints de API de auth (para poder hacer verifyOtp / resend)
    // 3. Static assets
    // 4. Logout (que suele ser un createClient().auth.signOut() client-side o ruta /auth/signout)
    //    Si logout es una ruta de Next (no API), hay que permitirla.
    //    En este proyecto parece ser client-side + redirect a login.

    // Bloquear todo lo demás (incluido /user/home, /admin, etc, e incluso /auth/login para forzar verificación)
    if (!isVerifyOtpPage && !isApiAuth && !isStaticAsset) {
      console.log(
        `[MW] Usuario con teléfono no verificado redirigido a /auth/verify-otp`,
      );
      const nextUrl = new URL("/auth/verify-otp", request.url);
      nextUrl.searchParams.set("phone", userPhone);

      // Solo preservar 'next' si no estamos en una ruta de auth (para no redirigir a login después)
      const isAuthPage = path.startsWith("/auth/");
      if (!isAuthPage && path !== "/") {
        nextUrl.searchParams.set("next", path);
      }

      return redirectWithCookies(nextUrl, supabaseResponse);
    }
  }

  // const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes("auth")); // Ya no es necesario para la lógica principal

  // --- GLOBAL ONBOARDING CHECK ---
  // Must be done before ANY other redirect to ensure it is seen "en todas las rutas".
  // Except API, Assets, and /onboarding itself.

  // const isStaticAsset = path.match(
  //   /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|json|woff|woff2|ttf)$/i
  // );

  const onboardingCookieName = user
    ? `onboarding_seen_${user.id}`
    : "onboarding_seen";
  const onboardingSeenCookie = request.cookies.get(onboardingCookieName);
  let hasCompletedOnboardingGlobal = !!onboardingSeenCookie;

  // Sync from DB if user is logged in but cookie is missing
  if (user && !hasCompletedOnboardingGlobal) {
    const am = (user?.app_metadata as Record<string, unknown>) || {};
    const um = (user?.user_metadata as Record<string, unknown>) || {};
    const dbOnboarding = um.onboarding_completed || am.onboarding_completed;
    if (dbOnboarding) {
      hasCompletedOnboardingGlobal = true;
      supabaseResponse.cookies.set(onboardingCookieName, "true", {
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
    !path.startsWith("/auth/") && // FIX: Allow auth routes (verify-email, verify-otp, login, etc)
    path !== "/onboarding" &&
    !isStaticAsset
  ) {
    console.log(
      "[MW-DEBUG] Global Check: Usuario no ha visto onboarding. Redirigiendo a /onboarding",
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
        1000,
      );
      const profile = result.data;
      role = profile?.role ?? null;
    } catch (e) {
      Sentry.captureException(e);
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
        (e as Error)?.message,
      );
    }
  }

  console.log(
    `[MW-DEBUG] Estado de autenticación: isAuthed=${isAuthed}, role=${role}`,
  );

  // 4. Definir rutas públicas y de autenticación
  const publicPaths = [
    "/",
    "/monitoring",
    "/sentry-example-page",
    "/onboarding",
    "/login",
    "/auth/login",
    "/auth/registro",
    "/auth/forgot-password",
    "/auth/update-password",
    "/auth/verify-email",
    "/auth/sign-up",
    "/auth/error",
    "/auth/auth-code-error",
    "/registro",
    "/registro/celular",
    "/admin/login",
    "/partner/login",
    "/partner/forgot-password",
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
    "/auth/verify-otp",
    "/repartidor/login",
  ];
  const authPaths = [
    "/login",
    "/auth/login",
    "/auth/registro",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/registro",
    "/registro/celular",
    "/admin/login",
    "/partner/login",
    "/partner/forgot-password",
    "/partner/registro",
    "/auth/callback",
    "/productos-y-servicios",
    "/auth/verify-otp",
    "/repartidor/login",
  ];

  const isPublicPath = publicPaths.includes(path);
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  console.log(
    `[MW-DEBUG] Análisis de ruta: isPublicPath=${isPublicPath}, isAuthPath=${isAuthPath}`,
  );

  // --- LÓGICA DE REDIRECCIÓN ---

  // 5. Lógica para usuarios YA AUTENTICADOS
  if (user) {
    console.log("[MW-DEBUG] Analizando lógica para usuario AUTENTICADO.");

    // --- Onboarding Check ---
    // const isStaticAsset = path.match(
    //   /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|json|woff|woff2|ttf)$/i
    // );
    const onboardingCookieName = `onboarding_seen_${user.id}`;
    const onboardingSeenCookie = request.cookies.get(onboardingCookieName);
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
        supabaseResponse.cookies.set(onboardingCookieName, "true", {
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
      !path.startsWith("/auth/") && // FIX: Also exclude auth from authenticated-user onboarding check fallback
      path !== "/onboarding" &&
      !isStaticAsset // This refers to the top helper const now
    ) {
      console.log(
        "[MW-DEBUG] Usuario no ha completado onboarding. Redirigiendo a /onboarding",
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

    // --- CHECK ADDRESS FOR USERS ---
    // Agregamos proteccion para usuarios sin direccion (finalUser)
    // Se salta si ya estamos en create-address, api, o assets
    // CAMBIO: Cookies por usuario
    const addressCookieName = `has_address_${user.id}`;
    const hasAddressCookie = request.cookies.get(addressCookieName);

    // Debug Log para Address Check
    const shouldCheckAddress =
      user &&
      (!role || role === "user" || role === "authenticated") &&
      !path.startsWith("/user/create-address") &&
      !path.startsWith("/api/") &&
      !path.startsWith("/_next/") &&
      !path.startsWith("/auth/") && // FIX: Exclude auth routes from address check
      path !== "/onboarding" &&
      !isStaticAsset;

    console.log(`[MW-DEBUG-ADDRESS] Vars: 
      Role=${role}, 
      Path=${path}, 
      hasCookie=${!!hasAddressCookie?.value},
      shouldCheck=${shouldCheckAddress}
    `);

    // SIEMPRE entramos si no hay cookie nueva.
    if (shouldCheckAddress && !hasAddressCookie && user) {
      console.log(
        `[MW-DEBUG] Verificando dirección para Usuario ${user.id}...`,
      );

      try {
        const { count, error } = await withTimeout(
          supabase
            .from("user_addresses")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          2000,
        );

        if (error) {
          console.error(
            "[MW-DEBUG] Error query user_addresses:",
            error.message,
          );
        } else {
          console.log(`[MW-DEBUG] Conteo direcciones: ${count}`);
        }

        if (count === 0) {
          console.log(
            "[MW-DEBUG] 🚨 Usuario sin dirección (count=0). Redirigiendo a /user/create-address",
          );
          return redirectWithCookies(
            new URL("/user/create-address", request.url),
            supabaseResponse,
          );
        } else if (count && count > 0) {
          console.log(
            `[MW-DEBUG] ✅ Usuario tiene dirección. Seteando cookie '${addressCookieName}'.`,
          );
          supabaseResponse.cookies.set(addressCookieName, "true", {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        console.warn("[MW-DEBUG] ⚠️ Excepción DB:", err);
      }
    }

    if (isAuthPath || path === "/") {
      const isVerifyOtpPage = path === "/auth/verify-otp";

      if (isVerifyOtpPage && !isPhoneVerified) {
        console.log(
          "[MW-DEBUG] Usuario autenticado PERMITIDO en /auth/verify-otp (Phone not verified).",
        );
        // Allow them to stay here to verify phone
        return supabaseResponse;
      }

      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] Usuario autenticado en ruta pública/auth ('${path}'). Redirigiendo a su home: ${homeUrl}`,
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse,
      );
    }

    // --- Control de acceso basado en roles (sin cambios) ---
    // ... (El resto de la lógica de roles permanece igual)
    const denyAccessAndRedirect = (reason: string) => {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] ACCESO DENEGADO: ${reason}. Rol: '${role}', Path: '${path}'. Redirigiendo a: ${homeUrl}`,
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse,
      );
    };

    if (path.startsWith("/admin") && role !== "admin") {
      return denyAccessAndRedirect("Área de admin requiere rol 'admin'");
    }
    if (path.startsWith("/partner/market") && role !== "market") {
      return denyAccessAndRedirect(
        "Área de Partner Market requiere rol 'market'",
      );
    }
    if (path.startsWith("/partner/restaurant") && role !== "restaurant") {
      return denyAccessAndRedirect(
        "Área de Partner Restaurant requiere rol 'restaurant'",
      );
    }
    if (path.startsWith("/repartidor") && role !== "delivery") {
      return denyAccessAndRedirect(
        "Área de Repartidor requiere rol 'delivery'",
      );
    }
    if (role && path.startsWith("/user")) {
      const specialRoles = ["admin", "market", "restaurant", "delivery"];
      if (specialRoles.includes(role as string)) {
        return denyAccessAndRedirect(
          "Roles especiales no pueden acceder al área de usuario general",
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
        `[MW-DEBUG] Redirigiendo ruta legacy '/aliado' a -> ${target.pathname}`,
      );
      return redirectWithCookies(target, supabaseResponse);
    }
    if (path === "/partner" || path === "/partner/") {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[MW-DEBUG] Usuario partner en ruta genérica '/partner'. Redirigiendo a su home: ${homeUrl}`,
      );
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse,
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
    // Si la ruta no es pública y no está autenticado, redirigir a Login
    console.log(
      `[MW-DEBUG] ⛔ Acceso denegado a ruta protegida: ${path}. Redirigiendo a /login...`,
    );
    const hiddenNext = new URL("/auth/login", request.url);
    // Opcional: pasar ?next=... si deseamos retorno
    if (path !== "/") {
      hiddenNext.searchParams.set("next", path + request.nextUrl.search);
    }
    return redirectWithCookies(hiddenNext, supabaseResponse);
  }

  return supabaseResponse;
}

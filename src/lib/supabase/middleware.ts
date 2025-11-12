import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Helper: create a redirect response and propagate any cookies Supabase asked us to set
  function redirectWithCookies(target: URL, base: NextResponse) {
    const res = NextResponse.redirect(target);
    // copy cookies that may have been set during auth refresh into the redirect response
    base.cookies.getAll().forEach(({ name, value }) => {
      res.cookies.set(name, value);
    });
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
  // console.log("[mw] ->", request.method, request.nextUrl.pathname, request.nextUrl.search);

  // 1. Crear una respuesta base que se usará para pasar a través o para redirigir.
  // Esto es crucial porque contendrá las cookies de sesión actualizadas.
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Crear el cliente de Supabase para el servidor.
  // Este cliente leerá y escribirá cookies según sea necesario.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Cuando Supabase necesite establecer cookies, las adjuntamos a nuestra respuesta base.
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // 3. Obtener la sesión del usuario con un límite de tiempo corto para evitar bloqueos del middleware.
  // IMPORTANTE: Esto también puede refrescar el token y actualizar las cookies en `supabaseResponse`.
  const withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("auth-timeout")), ms)
      ),
    ]);
  };

  let user: any = null;
  try {
    const {
      data: { user: u },
    } = (await withTimeout(supabase.auth.getUser(), 1200)) as any;
    user = u || null;
  } catch (e) {
    // En caso de timeout u otro error, continuamos como no autenticado para no colgar la navegación.
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH) {
      console.warn("[mw] getUser error/timeout", (e as Error)?.message);
    }
  }

  const path = request.nextUrl.pathname;
  const isAuthed = !!user;

  // Evitar consultas a la base de datos en middleware (runtime Edge) para prevenir bloqueos intermitentes.
  // Derivamos un rol "rápido" desde metadata del JWT si existe; los layouts harán la validación fuerte contra la DB.
  let role: string | null = null;
  if (isAuthed) {
    const am = (user?.app_metadata as any) || {};
    const um = (user?.user_metadata as any) || {};
    role = am.user_role || am.role || um.user_role || um.role || null;
  }

  // console.log(`[mw] Path: ${path}, Authed: ${isAuthed}, Role: ${role}`);

  // 4. Definir rutas públicas y de autenticación
  const publicPaths = [
    "/",
    "/login",
    "/admin/login",
    "/partner/login",
    "/partner/registro",
  ];
  const authPaths = [
    "/login",
    "/admin/login",
    "/partner/login",
    "/partner/registro",
    "/auth/callback",
  ];

  const isPublicPath = publicPaths.includes(path);
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // --- LÓGICA DE REDIRECCIÓN ---

  // 5. Lógica para usuarios YA AUTENTICADOS
  if (isAuthed) {
    // Si un usuario autenticado está en una página de inicio de sesión o en la home pública,
    // redirigirlo a su dashboard correspondiente.
    if (isAuthPath || path === "/") {
      const homeUrl = getHomeUrlForRole(role);
      // console.log(`[mw] Redirecting authed user from auth/public page to: ${homeUrl}`);
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    }

    // --- Control de acceso basado en roles ---

    const denyAccessAndRedirect = (reason: string) => {
      const homeUrl = getHomeUrlForRole(role);
      // console.log(`[mw] DENY: ${reason}. Role: '${role}', Path: '${path}'. Redirecting to: ${homeUrl}`);
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    };

    // Si la ruta es de admin, solo 'admin' puede acceder
    if (path.startsWith("/admin") && role !== "admin") {
      return denyAccessAndRedirect("Admin area requires 'admin' role");
    }
    // Enforce that only 'market' role can access /partner/market and any nested routes
    if (path.startsWith("/partner/market") && role !== "market") {
      return denyAccessAndRedirect(
        "Partner Market area requires 'market' role"
      );
    }
    // Solo 'restaurant' puede acceder a /partner/restaurant y subrutas
    if (path.startsWith("/partner/restaurant") && role !== "restaurant") {
      return denyAccessAndRedirect(
        "Partner Restaurant area requires 'restaurant' role"
      );
    }
    // Solo 'delivery' puede acceder a /repartidor y subrutas
    if (path.startsWith("/repartidor") && role !== "delivery") {
      return denyAccessAndRedirect("Repartidor area requires 'delivery' role");
    }
    if (role && path.startsWith("/user")) {
      const specialRoles = ["admin", "market", "restaurant", "delivery"];
      if (specialRoles.includes(role as string)) {
        return denyAccessAndRedirect(
          "Special roles cannot access general user area"
        );
      }
    }

    // Backward-compat: redirige /aliado/* a /partner/ROLE/*
    if (path.startsWith("/aliado")) {
      const base =
        role === "restaurant" ? "/partner/restaurant" : "/partner/market";
      const sub = path.replace(/^\/aliado/, "");
      const targetPath =
        sub && sub !== "" ? `${base}${sub}` : `${base}/dashboard`;
      const target = new URL(targetPath, request.url);
      target.search = request.nextUrl.search;
      // console.log(`[mw] Redirect legacy '/aliado' -> ${target.pathname}`);
      return redirectWithCookies(target, supabaseResponse);
    }

    // Si un partner entra a /partner sin especificar, llévalo a su dashboard
    if (path === "/partner" || path === "/partner/") {
      const homeUrl = getHomeUrlForRole(role);
      return redirectWithCookies(
        new URL(homeUrl, request.url),
        supabaseResponse
      );
    }
  }

  // 6. Lógica para usuarios NO AUTENTICADOS
  if (!isAuthed && !isPublicPath) {
    // console.log(`[mw] Redirecting unauthenticated user from protected route: ${path}`);

    // Redirige al login más relevante
    const loginPath = path.startsWith("/admin")
      ? "/admin/login"
      : path.startsWith("/partner") || path.startsWith("/aliado")
      ? "/admin/login" // <-- CORREGIDO
      : "/login";

    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", path);
    return redirectWithCookies(loginUrl, supabaseResponse);
  }

  // 7. Si ninguna regla de redirección se aplicó, permite el acceso.
  // Esta respuesta ya contiene las cookies actualizadas si las hubo.
  // console.log(`[mw] Allowing access to: ${path}`);
  return supabaseResponse;
}

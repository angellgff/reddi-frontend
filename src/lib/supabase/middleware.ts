import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // 3. Obtener la sesión del usuario
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
    console.warn(
      "[MW-DEBUG] Error o timeout en getUser:",
      (e as Error)?.message
    );
  }

  const isAuthed = !!user;
  // const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes("auth")); // Ya no es necesario para la lógica principal

  let role: string | null = null;
  if (isAuthed) {
    try {
      const { data: profile } = (await withTimeout(
        (supabase as any)
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single(),
        1000
      )) as any;
      role = (profile as any)?.role ?? null;
    } catch (e) {
      const am = (user?.app_metadata as any) || {};
      const um = (user?.user_metadata as any) || {};
      role = am.user_role || am.role || um.user_role || um.role || null;
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

  console.log(
    `[MW-DEBUG] Análisis de ruta: isPublicPath=${isPublicPath}, isAuthPath=${isAuthPath}`
  );

  // --- LÓGICA DE REDIRECCIÓN ---

  // 5. Lógica para usuarios YA AUTENTICADOS
  if (isAuthed) {
    console.log("[MW-DEBUG] Analizando lógica para usuario AUTENTICADO.");
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
    console.log(
      `[MW-DEBUG] Usuario NO autenticado intentando acceder a ruta protegida: '${path}'.`
    );
    const loginPath = path.startsWith("/admin")
      ? "/admin/login"
      : path.startsWith("/partner") || path.startsWith("/aliado")
      ? "/admin/login" // <-- CORREGIDO
      : "/login";

    console.log(
      `[MW-DEBUG] Redirigiendo a la página de login relevante: ${loginPath}`
    );
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", path);
    return redirectWithCookies(loginUrl, supabaseResponse);
  }

  // 7. Si ninguna regla se aplicó, permite el acceso
  console.log(
    `[MW-DEBUG] ✅ Acceso permitido a: ${path}. No se aplicó ninguna regla de redirección.`
  );
  return supabaseResponse;
}

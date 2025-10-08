import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.log(
    "[mw] ->",
    request.method,
    request.nextUrl.pathname,
    request.nextUrl.search
  );

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthed = !!user;

  // 1. Obtener el rol del usuario
  let role: string | null = null;
  if (isAuthed) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role || null;
  }

  console.log(`[mw] Path: ${path}, Authed: ${isAuthed}, Role: ${role}`);

  // 2. Definir rutas públicas y de autenticación
  const publicPaths = ["/login", "/admin/login", "/aliado/registro"];
  const authPaths = [
    "/login",
    "/admin/login",
    "/aliado/registro",
    "/auth/callback",
  ];

  const isPublicPath = publicPaths.includes(path);
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // 3. Lógica para usuarios YA AUTENTICADOS
  if (isAuthed) {
    if (isAuthPath) {
      const homeUrl = getHomeUrlForRole(role);
      console.log(
        `[mw] Redirecting authenticated user from auth page to: ${homeUrl}`
      );
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // 4. Control de acceso basado en roles para rutas protegidas

    // Usuario en sección /admin
    if (path.startsWith("/admin") && role !== "admin") {
      return denyAccess(request, role, "Admin area requires 'admin' role");
    }

    // ====================================================================
    //              CAMBIO PRINCIPAL: Múltiples roles de aliado
    // ====================================================================
    // Usuario en sección /aliado
    if (path.startsWith("/aliado")) {
      const allowedAliadoRoles = ["market", "restaurant"]; // <-- Lista de roles permitidos
      if (!allowedAliadoRoles.includes(role as string)) {
        return denyAccess(
          request,
          role,
          "Aliado area requires 'market' or 'restaurant' role"
        );
      }
    }

    // Usuario en sección /repartidor
    if (path.startsWith("/repartidor") && role !== "delivery") {
      return denyAccess(
        request,
        role,
        "Repartidor area requires 'delivery' role"
      );
    }

    // Usuario con rol especial en el área de usuario general
    if (path.startsWith("/user")) {
      const specialRoles = ["admin", "market", "restaurant", "delivery"]; // <-- Lista de roles que NO deben estar aquí
      if (specialRoles.includes(role as string)) {
        return denyAccess(
          request,
          role,
          "Special roles cannot access general user area"
        );
      }
    }
  }

  // 5. Lógica para usuarios NO AUTENTICADOS
  if (!isAuthed && !isPublicPath) {
    console.log(
      `[mw] Redirecting unauthenticated user from protected route: ${path}`
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[mw] Allowing access to: ${path}`);
  return supabaseResponse;
}

// --- Helper Functions ---

/**
 * Determina la URL del dashboard principal según el rol del usuario.
 * AÑADIDO: Soporte para el rol 'restaurant'.
 */
function getHomeUrlForRole(role: string | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "market":
      return "/aliado/dashboard";
    case "restaurant":
      // Asumimos que los restaurantes también van al dashboard de aliado.
      // ¡Cámbialo si tienen su propia página de inicio!
      return "/aliado/dashboard";
    case "delivery":
      return "/repartidor/home";
    default:
      return "/user/home";
  }
}

/**
 * Genera una respuesta de redirección cuando se niega el acceso a una ruta.
 */
function denyAccess(
  request: NextRequest,
  role: string | null,
  reason: string
): NextResponse {
  const homeUrl = getHomeUrlForRole(role);
  console.log(
    `[mw] DENY: ${reason}. Role: '${role}', Path: '${request.nextUrl.pathname}'. Redirecting to: ${homeUrl}`
  );
  return NextResponse.redirect(new URL(homeUrl, request.url));
}

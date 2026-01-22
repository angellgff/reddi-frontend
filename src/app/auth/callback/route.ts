import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  console.log("----------------------------------------");
  console.log("[AuthCallback] START request:", request.url);

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Default fallback if no role is found
  let next = requestUrl.searchParams.get("next") ?? "/user/home";

  console.log("[AuthCallback] Params -> Code present:", !!code, "Next:", next);

  // --- LÓGICA DE DETECCIÓN DEL DOMINIO REAL ---
  let targetBaseUrl = "";

  console.log(
    "[AuthCallback] ENV Check -> NEXT_PUBLIC_BASE_URL:",
    process.env.NEXT_PUBLIC_BASE_URL,
  );
  console.log(
    "[AuthCallback] ENV Check -> NEXT_PUBLIC_SITE_URL:",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  // 1. ¿Tenemos una variable de entorno fija? (Lo más seguro para Producción)
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  if (envUrl) {
    targetBaseUrl = envUrl;
  }
  // 2. Si no, ¿estamos detrás de un proxy (Vercel/Netlify/AWS)?
  else if (request.headers.has("x-forwarded-host")) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost?.split(",")[0].trim();
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    targetBaseUrl = `${protocol}://${host}`;
  }
  // 3. Fallback final (generalmente solo para localhost real)
  else {
    targetBaseUrl = requestUrl.origin;
  }

  // Fix for 0.0.0.0 in dev environment
  if (targetBaseUrl.includes("0.0.0.0")) {
    targetBaseUrl = targetBaseUrl.replace(/0\.0\.0\.0/g, "localhost");
  }

  // Debug log
  console.log(`[AuthCallback] Resolved Base URL: ${targetBaseUrl}`);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AuthCallback] Exchange Error:", error.message);
    } else {
      console.log("[AuthCallback] Session exchanged successfully.");
      // --- RECUPERAR DATOS DEL USUARIO Y ROL ---
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          let role: string | null = null;

          // Intentar obtener rol desde la tabla profiles
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            role = profile?.role ?? null;
          } catch (profileError) {
            console.warn(
              "Failed to load profile for role in auth callback",
              profileError,
            );
          }

          // Fallback a metadatos si no se encuentra en profiles
          if (!role) {
            const appMeta =
              (user.app_metadata as Record<string, unknown>) || {};
            const userMeta =
              (user.user_metadata as Record<string, unknown>) || {};
            role =
              (appMeta?.user_role as string) ||
              (appMeta?.role as string) ||
              (userMeta?.user_role as string) ||
              (userMeta?.role as string) ||
              null;
          }

          // Determinar ruta según el rol
          switch ((role || "").toLowerCase()) {
            case "admin":
              next = "/admin/dashboard";
              break;
            case "market":
              next = "/partner/market/dashboard";
              break;
            case "restaurant":
              next = "/partner/restaurant/dashboard";
              break;
            case "delivery":
              next = "/repartidor/home";
              break;
            default:
              next = "/user/home";
              break;
          }

          // Validar intent de partner (Check Query Param OR Cookie)
          const cookieStore = await cookies();
          const cookieIntent = cookieStore.get("auth_intent")?.value;
          const paramIntent = requestUrl.searchParams.get("intent");
          const intent = paramIntent || cookieIntent;

          console.log(
            "[AuthCallback] Role Detection -> Detected Role:",
            role,
            "Intent:",
            intent,
            "(Source:",
            paramIntent ? "param" : cookieIntent ? "cookie" : "none",
            ")",
          );

          // Cleanup cookie if present
          if (cookieIntent) {
            cookieStore.delete("auth_intent");
          }

          if (intent === "partner") {
            const currentRole = (role || "").toLowerCase();
            if (currentRole !== "market" && currentRole !== "restaurant") {
              console.warn(
                "[AuthCallback] Access Denied: Partner intent but role is",
                currentRole,
              );
              await supabase.auth.signOut();
              // Encode error message properly
              const errorMsg = encodeURIComponent(
                "Acceso denegado: Esta cuenta no es de partner",
              );
              return NextResponse.redirect(
                `${targetBaseUrl}/partner/login?error=${errorMsg}`,
              );
            }
          }
        }
      } catch (err) {
        console.error("Error determining user role during auth callback", err);
      }

      // --- SANITIZACIÓN Y REDIRECCIÓN ---

      const sanitizedNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/user/home";

      const redirectUrl = new URL(sanitizedNext, targetBaseUrl);
      redirectUrl.searchParams.delete("code");

      console.log(
        "[AuthCallback] SUCCESS -> Redirecting to:",
        redirectUrl.toString(),
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Error: devolver al usuario al dominio detectado
  console.log(
    "[AuthCallback] FAILURE/NO-CODE -> Redirecting to error page:",
    `${targetBaseUrl}/auth/auth-code-error`,
  );
  return NextResponse.redirect(`${targetBaseUrl}/auth/auth-code-error`);
}

import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  console.log("[AuthCallback] Hit!", request.url);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Default fallback if no role is found
  let next = requestUrl.searchParams.get("next") ?? "/user/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- LÓGICA DE DETECCIÓN DEL DOMINIO REAL ---
      let targetBaseUrl = "";

      // 1. ¿Tenemos una variable de entorno fija? (Lo más seguro para Producción)
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        targetBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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

      // --- RECUPERAR DATOS DEL USUARIO Y ROL ---
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
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
            console.warn("Failed to load profile for role in auth callback", profileError);
          }

          // Fallback a metadatos si no se encuentra en profiles
          if (!role) {
            const appMeta = (user.app_metadata as Record<string, unknown>) || {};
            const userMeta = (user.user_metadata as Record<string, unknown>) || {};
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
        }
      } catch (err) {
        console.error("Error determining user role during auth callback", err);
      }

      // --- SANITIZACIÓN Y REDIRECCIÓN ---
      
      const sanitizedNext = (next.startsWith("/") && !next.startsWith("//")) 
        ? next 
        : "/user/home";

      const redirectUrl = new URL(sanitizedNext, targetBaseUrl);
      redirectUrl.searchParams.delete("code");

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Error: devolver al usuario al mismo dominio detectado
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
}
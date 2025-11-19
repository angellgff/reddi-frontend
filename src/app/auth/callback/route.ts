import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // 1. RECUPERAR EL PARAMETRO 'next'
  // Si no viene, por defecto mandamos a /user/home
  const next = searchParams.get("next") ?? "/user/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 2. REDIRIGIR AL DESTINO DESEADO
      // Importante: Usamos ${origin}${next} para construir la URL completa
      const forwardedHost = request.headers.get("x-forwarded-host"); // Soporte para proxys/deployments
      const isLocal = origin.includes("localhost");

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Si hay error, devolvemos al login
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

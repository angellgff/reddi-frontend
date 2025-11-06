// app/api/auth/logout/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();

  // Usamos EXCLUSIVAMENTE la firma moderna con getAll y setAll
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Asegúrate de que el nombre de esta variable es correcto para tu proyecto
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Usamos request.cookies.set() para establecer las cookies en la respuesta
              // Este es el método correcto en el contexto de una Route Handler.
              cookieStore.set(name, value, options);
            });
          } catch {
            // Este bloque catch es principalmente para Server Components.
            // En una API Route, es menos probable que falle, pero es bueno tenerlo.
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión desde la API route:", error);
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Cierre de sesión exitoso" });
}

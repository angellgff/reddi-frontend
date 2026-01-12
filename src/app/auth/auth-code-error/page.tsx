"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import Spinner from "@/src/components/basics/Spinner";
import Link from "next/link";

export default function AuthCodeError() {
  const router = useRouter();
  const supabase = createClient();
  const [isRecovering, setIsRecovering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const recoverSession = async () => {
      // Check if we have tokens in the URL hash (Implicit Flow)
      if (
        window.location.hash &&
        window.location.hash.includes("access_token")
      ) {
        console.log("Detectado token en URL, intentando recuperar sesión...");
        try {
          // supabase-js automáticamente detecta el hash y establece la sesión
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) throw error;

          if (session) {
            console.log("Sesión recuperada exitosamente!");
            // Redirigir al usuario
            router.replace("/user/home");
            return;
          }
        } catch (err: any) {
          console.error("Error recuperando sesión del hash:", err);
          setError(err.message || "Error procesando la autenticación");
        }
      } else {
        // Si no hay hash, es un error genuino de PKCE o código inválido
        setError("El enlace de verificación es inválido o ha expirado.");
      }
      setIsRecovering(false);
    };

    recoverSession();
  }, [supabase, router]);

  if (isRecovering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <Spinner className="border-primary w-8 h-8 text-[#04BD88]" />
        <p className="mt-4 text-[#484848] font-medium">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 font-openSans">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#1C1C1C]">
          Problema de Autenticación
        </h1>

        <p className="text-[#484848] text-sm leading-relaxed">
          {error ||
            "Hubo un problema verificando tu cuenta. Por favor intenta iniciar sesión nuevamente."}
        </p>

        <div className="pt-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center h-[50px] px-8 bg-[#04BD88] rounded-[18px] text-white font-bold text-[15px] hover:bg-[#03a072] transition-colors"
          >
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";
import Spinner from "@/src/components/basics/Spinner";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleResend = async () => {
    if (!email) {
      alert("No se ha especificado un correo electrónico.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("Correo de verificación reenviado exitosamente.");
    } catch (error: any) {
      console.error("Error resending email:", error);
      // Supabase rate limit handling
      const msg = error.message?.toLowerCase() || "";

      if (
        msg.includes("security purposes") ||
        (msg.includes("after") && msg.includes("seconds"))
      ) {
        setMessage(
          "Por favor espera unos segundos antes de intentar nuevamente."
        );
      } else if (msg.includes("rate limit")) {
        setMessage("Límite de intentos excedido. Espera unos minutos.");
      } else {
        setMessage("Error al reenviar el correo. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-t-[30px] md:rounded-[46px] p-6 pb-12 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative min-h-[calc(65vh+24px)] md:min-h-[500px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">
          Verifica tu correo
        </h1>

        <p className="text-[13px] text-[#484848] leading-[18px]">
          Hemos enviado un enlace de confirmación a:
          <br />
          <span className="font-bold text-black">{email}</span>
        </p>

        <p className="text-[13px] text-[#484848] leading-[18px]">
          Debes verificar tu correo electrónico para poder acceder a la
          aplicación.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
          <p className="text-[12px] text-yellow-800 font-medium mb-1">
            ¿No recibes el correo?
          </p>
          <ul className="text-[11px] text-yellow-700 list-disc list-inside space-y-1">
            <li>
              Revisa tu carpeta de <strong>Spam</strong> o Correo no deseado.
            </li>
            <li>Espera unos minutos, el envío puede tardar.</li>
          </ul>
        </div>

        <div className="pt-2 w-full">
          <button
            onClick={handleResend}
            disabled={isLoading || !email}
            className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[15px] hover:bg-[#03a072] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Spinner className="w-4 h-4" />
            ) : (
              "Reenviar correo de verificación"
            )}
          </button>
        </div>

        {message && (
          <p
            className={`text-[12px] font-medium ${
              message.includes("exitosamente")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/auth/login"
            className="text-[13px] text-[#6A6C71] underline hover:text-black"
          >
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

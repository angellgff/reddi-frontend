"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthInput from "@/src/components/basics/auth/AuthInput";
import Spinner from "@/src/components/basics/Spinner";
import { verifyOtpAction, resendOtpAction } from "@/src/lib/actions/auth";
import Link from "next/link";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get phone from URL params
  const phone = searchParams.get("phone") || "";
  const nextParam = searchParams.get("next");

  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!phone) {
      // If no phone provided, redirect back to login
      router.replace("/auth/login");
    }
  }, [phone, router]);

  const handleVerify = async () => {
    if (!token || token.length < 6) {
      setErrorMessage("Ingresa el código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await verifyOtpAction(phone, token);

      if (result.success) {
        setSuccess(true);
        // Refresh router to ensure middleware picks up new session cookie
        router.refresh();

        // Redirect to next param or default logic
        const target = nextParam || "/user/home";
        router.push(target);
      } else {
        setErrorMessage(result.error || "Código inválido. Intenta nuevamente.");
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setErrorMessage("");
    try {
      const result = await resendOtpAction(phone);

      if (!result.success) {
        setErrorMessage(result.error || "Error al reenviar código.");
      } else {
        alert("Código reenviado exitosamente.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión al reenviar código.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-t-[30px] md:rounded-[46px] p-6 pb-12 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative min-h-[calc(65vh+24px)] md:min-h-[600px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto">
      <div className="w-full mt-8 mb-6 text-center">
        <h2 className="text-[#1C1C1C] font-bold text-[24px] mb-2">
          Verificación
        </h2>
        <p className="text-[#6A6C71] text-[14px]">
          Ingresa el código de 6 dígitos enviado a <br />
          <span className="font-semibold text-black">{phone}</span>
        </p>
      </div>

      <div className="w-full px-4 flex flex-col gap-6">
        <AuthInput
          label="Código de Verificación"
          type="text"
          placeholder="123456"
          value={token}
          onChange={(e) => {
            // Only allow numbers
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setToken(val);
            setErrorMessage("");
          }}
          error={errorMessage}
          className="text-center tracking-widest text-lg"
        />

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={handleVerify}
            disabled={isLoading || !token}
            className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : "Verificar"}
          </button>

          <button
            onClick={handleResend}
            disabled={resendLoading || isLoading}
            className="w-full h-[40px] bg-transparent text-[#04BD88] font-semibold text-[14px] hover:bg-gray-50 rounded-[18px] transition-colors"
          >
            {resendLoading
              ? "Enviando..."
              : "¿No recibiste el código? Reenviar"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/login"
            className="text-[#6A6C71] text-[13px] underline"
          >
            Volver a inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

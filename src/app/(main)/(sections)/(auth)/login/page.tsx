"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";

function LoginContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const startRef = useRef(false);
  const debug = !!process.env.NEXT_PUBLIC_DEBUG_AUTH;

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const next = searchParams.get("next") || "/user/home";

      console.log("[GoogleLogin] Initiating OAuth (Client-side)", { next });

      const siteUrl =
        (typeof window !== "undefined" &&
          (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)) ||
        undefined;

      const redirectPublic = siteUrl ? `${siteUrl}/auth/callback` : undefined;

      const finalRedirectTo =
        redirectPublic ?? `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: finalRedirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (e) {
      const err = e as Error;
      console.error("[login/google] error", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, searchParams]);

  // Handle redirect if already logged in
  useEffect(() => {
    if (startRef.current) return;
    startRef.current = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const next = searchParams.get("next") || "/user/home";
        router.replace(next);
      }
    })();
  }, [supabase, router, searchParams]);

  return (
    <div className="w-[calc(100%+3rem)] -mx-6 -mb-20 bg-white rounded-t-[30px] md:rounded-[46px] p-6 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative overflow-hidden min-h-[calc(100vh-200px)] md:min-h-[500px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto">
      {/* Toggle: Login / Register */}
      <div className="relative w-[222px] h-[39px] bg-[#DADADA] rounded-[24px] flex mb-[22px] mt-8 cursor-pointer shadow-none">
        <div className="z-10 bg-[#04BD88] rounded-[24px] w-[113px] flex items-center justify-center text-white font-bold text-[13px] shadow-sm transform transition-transform">
          <span className="leading-[18px]">Iniciar sesión</span>
        </div>
        <Link
          href="/registro"
          className="absolute right-0 top-0 bottom-0 w-[120px] flex items-center justify-center text-[#1C1C1C] font-bold text-[13px] pr-2"
        >
          <span className="leading-[18px]">Regístrate</span>
        </Link>
      </div>

      <div className="w-full px-4 flex flex-col gap-[22px]">
        {/* Email Input */}
        <div className="w-full">
          <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
            Email
          </label>
          <div className="bg-[#F4F5F7] rounded-[8px] h-[34px] flex items-center px-4 w-full">
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              className="bg-transparent w-full text-[13px] text-[#484848] placeholder-[#484848] outline-none font-normal"
            />
          </div>
        </div>

        {/* Use Phone Link */}
        <div className="w-full">
          <button
            type="button"
            className="text-[10px] font-bold text-[#6A6C71] underline leading-[20px]"
          >
            Utilizar número de teléfono
          </button>
        </div>

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center my-1 select-none">
          <div className="absolute w-full h-[1px] bg-[#6A6C71] opacity-50"></div>
          <span className="relative bg-white px-2 text-[10px] font-bold text-[#6A6C71] leading-[20px]">
            O continua con su numero de telefono
          </span>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-[10px] w-full">
          <button
            className="w-full h-[38px] bg-[#3B579D] rounded-[24px] flex items-center justify-center gap-2 transition-all hover:bg-[#2f467d]"
            disabled={true}
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center relative">
              <Image
                src={facebookLogo}
                alt="Facebook"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-[15px] leading-[20px]">
              Continuar con Facebook
            </span>
          </button>

          <button
            className="w-full h-[38px] bg-[#DADADA] rounded-[24px] flex items-center justify-center gap-2 transition-all hover:bg-[#c4c4c4]"
            onClick={(e) => {
              e.preventDefault();
              handleGoogleLogin();
            }}
            disabled={isLoading}
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center relative">
              <Image
                src={googleLogo}
                alt="Google"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[#1C1C1C] font-bold text-[15px] leading-[20px]">
              {isLoading ? "Conectando..." : "Continuar con Google"}
            </span>
          </button>

          <button
            className="w-full h-[38px] bg-black rounded-[24px] flex items-center justify-center gap-2 transition-all hover:bg-gray-900"
            disabled={true}
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center text-white">
              <AppleIcon className="w-[20px] h-[20px] text-white fill-current" />
            </div>
            <span className="text-white font-bold text-[15px] leading-[20px]">
              Continuar con Apple
            </span>
          </button>
        </div>

        {/* Main Continue Button */}
        <div className="mt-4 w-full">
          <button className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center">
            Continuar
          </button>
        </div>

        {/* Footer Text */}
        <div className="w-full text-center px-2 pb-6">
          <p className="text-[10px] text-[#6A6C71] leading-[14px]">
            Al presionar cualquier botón de “Continuar”, aceptas nuestros{" "}
            <Link href="/terminos-y-condiciones" className="underline">
              Términos y Condiciones
            </Link>{" "}
            y nuestra{" "}
            <Link href="/privacidad" className="underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

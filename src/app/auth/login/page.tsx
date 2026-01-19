"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  useActionState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/src/lib/actions/auth";
import { createClient } from "@/src/lib/supabase/client";

import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import AuthInput from "@/src/components/basics/auth/AuthInput";

function LoginContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, formAction, isPending] = useActionState(loginAction, null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const startRef = useRef(false);

  /* Removed useEffect that showed alert */

  // Local state for field errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const clearErrors = () => setErrors({});

  // Sync server state error to local errors
  useEffect(() => {
    if (state?.error) {
      if (
        state.error.toLowerCase().includes("email") || 
        state.error.toLowerCase().includes("user")
      ) {
        setErrors({ email: state.error });
      } else {
        setErrors({ password: state.error });
      }
    }
  }, [state]);

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
    <div className="w-full bg-white rounded-t-[30px] md:rounded-[46px] p-6 pb-12 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative min-h-[calc(65vh+24px)] md:min-h-[500px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto">
      {/* Toggle: Login / Register */}
      <div className="relative w-[222px] h-[39px] bg-[#DADADA] rounded-[24px] flex mb-[22px] mt-8 cursor-pointer shadow-none">
        <div className="z-10 bg-[#04BD88] rounded-[24px] w-[113px] flex items-center justify-center text-white font-bold text-[13px] shadow-sm transform transition-transform">
          <span className="leading-[18px]">Iniciar sesión</span>
        </div>
        <Link
          href="/auth/registro"
          className="absolute right-0 top-0 bottom-0 w-[120px] flex items-center justify-center text-[#1C1C1C] font-bold text-[13px] pr-2"
        >
          <span className="leading-[18px]">Regístrate</span>
        </Link>
      </div>

      <form
        action={formAction}
        className="w-full px-4 flex flex-col gap-[22px]"
      >
        <input
          type="hidden"
          name="next"
          value={searchParams.get("next") || "/user/home"}
        />

        {/* Email Input */}
        <AuthInput
          name="email"
          label="Email"
          type="email"
          placeholder="ejemplo@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearErrors();
          }}
          error={errors.email}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!showPassword) {
                e.preventDefault();
                if (email) setShowPassword(true);
              }
            }
          }}
        />

        {/* Password Input (Conditional) */}
        {showPassword && (
          <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <AuthInput
              name="password"
              label="Contraseña"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearErrors();
              }}
              onKeyDown={(e) => {
                // Enter submits implicitly
              }}
              error={errors.password}
            />
          </div>
        )}

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center my-1 select-none">
          <div className="absolute w-full h-[1px] bg-[#6A6C71] opacity-50"></div>
          <span className="relative bg-white px-2 text-[10px] font-bold text-[#6A6C71] leading-[20px]">
            O continuar con
          </span>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-[10px] w-full">
          <button
            type="button"
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
            type="button"
            className="w-full h-[38px] bg-[#DADADA] rounded-[24px] flex items-center justify-center gap-2 transition-all hover:bg-[#c4c4c4]"
            onClick={(e) => {
              e.preventDefault();
              handleGoogleLogin();
            }}
            disabled={isLoading || isPending}
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
            type="button"
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
          <button
            type="submit"
            onClick={(e) => {
              if (!showPassword) {
                e.preventDefault();
                if (email) setShowPassword(true);
              }
            }}
            className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center"
            disabled={isPending || isLoading}
          >
            {isPending || isLoading
              ? "Cargando..."
              : showPassword
                ? "Iniciar Sesión"
                : "Continuar"}
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
      </form>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div></div>}>
      <LoginContent />
    </Suspense>
  );
}

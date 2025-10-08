"use client";
import Image from "next/image";
import Link from "next/link";
import SessionButton from "@/src/components/basics/LinkButton";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import PhoneIcon from "@/src/components/icons/PhoneIcon";
import FormTitle from "@/src/components/basics/auth/FormTitle";
import { createClient } from "@/src/lib/supabase/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const sessionsButtonData = [
  {
    provider: "Facebook",
    icon: <Image src={facebookLogo} alt="" className="h-8 w-8 "></Image>,
    href: "#",
  },
  {
    provider: "Google",
    icon: <Image src={googleLogo} alt="" className="h-8 w-8"></Image>,
    href: "#",
  },
  {
    provider: "Apple",
    icon: <AppleIcon className="h-8 w-8" />,
    href: "#",
  },
  {
    provider: "Celular",
    icon: <PhoneIcon className="h-8 w-8" />,
    href: "#",
  },
];

export default function Login() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirectedRef = useRef(false);
  const debug = !!process.env.NEXT_PUBLIC_DEBUG_AUTH;
  // Construir URL base para redirecciones (permite override por env)
  const siteUrl =
    (typeof window !== "undefined" &&
      (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)) ||
    undefined;

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const next = searchParams.get("next") || "/user/home";
      // Redirigimos a una ruta pública (auth/login) con parámetro next
      const redirectPublic = siteUrl
        ? `${siteUrl}/login?next=/user/home`
        : undefined;
      if (debug)
        console.log("[login/google] start", {
          next,
          siteUrl,
          redirectPublic,
          location:
            typeof window !== "undefined" ? window.location.href : "ssr",
        });

      if (debug) console.log("[login/google] calling signInWithOAuth");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectPublic,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (debug)
        console.log("[login/google] signInWithOAuth result", {
          hasUrl: !!data?.url,
          error: error?.message,
        });
      if (error) throw error;
      if (data?.url) {
        if (debug)
          console.log("[login/google] navigating to data.url", data.url);
        window.location.href = data.url;
        return;
      }
      // Fallback: if no redirect happened for some reason
      if (debug)
        console.warn(
          "[login/google] no data.url returned, using router.replace",
          next
        );
      router.replace(next);
    } catch (e) {
      const err = e as Error;
      console.error("[login/google] error", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams, supabase]);

  // Debug auth lifecycle on this page (optional, controlled by env)
  // Also handle in-page redirect after OAuth callback returns here.
  useEffect(() => {
    if (!debug) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.warn("[login/debug] getSession error", error.message);
      if (mounted)
        console.log("[login/debug] initial session?", !!data.session);
    })();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[login/debug] onAuthStateChange", event, !!session);
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [debug, supabase]);

  // If the user is already authenticated when landing on /login, redirect now
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (debug) console.warn("[login/init] getSession error", error.message);
        return;
      }
      if (active && data.session && !hasRedirectedRef.current) {
        const next = searchParams.get("next") || "/user/home";
        hasRedirectedRef.current = true;
        if (debug) console.log("[login/init] redirecting to", next);
        router.replace(next);
      }
    })();
    // Also react immediately to a successful sign in
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session && !hasRedirectedRef.current) {
          const next = searchParams.get("next") || "/user/home";
          hasRedirectedRef.current = true;
          if (debug) console.log("[login/event] redirecting to", next);
          router.replace(next);
        }
      }
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [debug, router, searchParams, supabase]);

  return (
    <>
      <FormTitle title="Iniciar sesión" />
      {sessionsButtonData.map((button) => {
        const isGoogle = button.provider === "Google";
        return (
          <SessionButton
            key={button.provider}
            href={button.href}
            onClick={
              isGoogle
                ? (e) => {
                    e.preventDefault();
                    handleGoogleLogin();
                  }
                : undefined
            }
            className={`w-full h-14 gap-2 hover:bg-primary hover:border-white md:w-[70%] lg:w-[50%] truncate ${
              isGoogle && isLoading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {button.icon}
            <span>
              {isGoogle && isLoading ? (
                "Conectando con Google..."
              ) : (
                <>
                  Continuar con <b>{button.provider}</b>
                </>
              )}
            </span>
          </SessionButton>
        );
      })}
      <SessionButton
        href="/admin/login"
        className={`w-full h-14 gap-2 hover:bg-primary hover:border-white md:w-[70%] lg:w-[50%] truncate`}
      >
        Administrador
      </SessionButton>
      <p className="text-center">
        ¿Todavía no tienes una cuenta?{" "}
        <Link
          href="/auth/sign-up"
          className="text-primary font-bold font-roboto hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </>
  );
}

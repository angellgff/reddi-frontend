"use client";

import { useEffect, useRef, useState } from "react";
import PasswordInput from "./PasswordInput";
import UserLoginIcon from "@/src/components/icons/UserLoginIcon";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const recoveryAccountLink = "/auth/forgot-password";

export default function LoginForm({
  title = "Iniciar sesión",
}: {
  title?: string;
}) {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);

  // Helpers: derive role and home path

  const homeForRole = (role?: string | null) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "/admin/dashboard";
      case "market":
        // ANTES: return "/aliado/dashboard";
        return "/partner/market/dashboard"; // DESPUÉS: URL moderna y correcta
      case "restaurant": // Buena práctica añadirlo para consistencia
        return "/partner/restaurant/dashboard";
      case "delivery":
        return "/repartidor/home";
      default:
        return "/user/home";
    }
  };

  const resolveRole = async (supabase: ReturnType<typeof createClient>) => {
    const { data: sessionRes } = await supabase.auth.getSession();
    const user = sessionRes.session?.user;
    if (!user) return null;
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, user_role")
        .eq("id", user.id)
        .single();
      if (!profileError) {
        const pr = (profile as any) || {};
        return pr.role || pr.user_role || null;
      }
    } catch (e) {
      // ignore and fallback
    }
    const am = (user.app_metadata as any) || {};
    const um = (user.user_metadata as any) || {};
    return am.user_role || am.role || um.user_role || um.role || null;
  };

  // Redirección si ya hay sesión activa (p. ej., al volver de OAuth)
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session && !hasRedirectedRef.current) {
        const next = searchParams.get("next");
        let to = next || homeForRole(await resolveRole(supabase));
        hasRedirectedRef.current = true;
        router.replace(to);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && !hasRedirectedRef.current) {
          const handle = async () => {
            const next = searchParams.get("next");
            const role = await resolveRole(supabase);
            const to = next || homeForRole(role);
            hasRedirectedRef.current = true;
            router.replace(to);
          };
          // run and ignore promise
          handle();
        }
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const next = searchParams.get("next");
      const role = await resolveRole(supabase);
      const to = next || homeForRole(role);
      // Recordarme: Supabase por defecto usa localStorage; si quieres sessionStorage podemos ajustarlo.
      router.replace(to);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* --- TÍTULO --- */}
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6 pointer-events-none">
        {title}
      </h1>

      {/* --- FORMULARIO --- */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- CAMPO DE NOMBRE/EMAIL --- */}
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-600 font-roboto"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <UserLoginIcon className="h-5 w-5 " />
            </span>
            <input
              autoComplete="email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-xl font-roboto"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* --- CAMPO DE CONTRASEÑA --- */}
        <PasswordInput
          isPasswordDisplayed={showPassword}
          passwordValue={password}
          displayPassword={setShowPassword}
          myOnChange={setPassword}
          label="Contraseña"
          disabled={isLoading}
        />

        {/* --- MENSAJE DE ERROR --- */}
        {error && (
          <p className="text-sm text-red-600 px-2" role="alert">
            {error}
          </p>
        )}

        {/* --- OPCIONES (RECORDARME Y OLVIDÉ CONTRASEÑA) --- */}
        <div className="flex items-center justify-between text-sm px-2 text-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded "
              disabled={isLoading}
            />
            <label htmlFor="remember" className="text-gray-600">
              Recordarme
            </label>
          </div>
          <Link
            href={recoveryAccountLink}
            className="font-medium text-emerald-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* --- BOTÓN DE INICIAR SESIÓN --- */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-medium py-2 px-4 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300 disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>

      {/* --- CTA SOCIO / ALIADO --- */}
      <div className="mt-8 text-center text-sm text-gray-700 space-y-2">
        <p className="leading-snug">¿Quieres ser uno de nuestros socios?</p>
        <Link
          href="/partner/registro"
          className="inline-block bg-primary text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary"
          aria-label="Ir al registro de socios aliados"
        >
          Haz clic aquí
        </Link>
      </div>
    </>
  );
}

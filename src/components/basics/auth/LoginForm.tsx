"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import PasswordInput from "./PasswordInput";
import UserLoginIcon from "@/src/components/icons/UserLoginIcon";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/src/lib/actions/auth";

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

  const [state, formAction, isPending] = useActionState(loginAction, null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);

  // Helpers: derive role and home path

  const homeForRole = (role?: string | null) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return "/admin/dashboard";
      case "market":
        return "/partner/market/dashboard";
      case "restaurant":
        return "/partner/restaurant/dashboard";
      case "delivery":
        return "/repartidor/home";
      default:
        // Si el rol es null o desconocido, va a la home de usuario estándar
        return "/user/home";
    }
  };

  // --- FUNCIÓN `resolveRole` MODIFICADA ---
  // Ahora solo consulta la tabla 'profiles' y NUNCA la metadata.
  const resolveRole = async (supabase: ReturnType<typeof createClient>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Si hay un error en la consulta, lo registramos y devolvemos null
      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return null;
      }

      // Si se encuentra el perfil, se devuelve el rol priorizando 'user_role'.
      // Si ambas columnas son null, el OR devolverá null.
      if (profile) {
        return profile.role || null;
      }

      // Si no se encuentra un perfil para el usuario, se devuelve null.
      return null;
    } catch (e) {
      console.error("An unexpected error occurred in resolveRole:", e);
      // Ante cualquier excepción inesperada, se devuelve null por seguridad.
      return null;
    }
  };

  // Redirección si ya hay sesión activa (p. ej., al volver de OAuth)
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session && !hasRedirectedRef.current) {
        const next = searchParams.get("next");
        const role = await resolveRole(supabase); // Usando la nueva función
        const to = next || homeForRole(role);
        hasRedirectedRef.current = true;
        router.replace(to);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && !hasRedirectedRef.current) {
          const handle = async () => {
            const next = searchParams.get("next");
            const role = await resolveRole(supabase); // Usando la nueva función
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
  // handleSubmit removed in favor of server action

  return (
    <>
      {/* --- TÍTULO --- */}
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6 pointer-events-none">
        {title}
      </h1>

      {/* --- FORMULARIO --- */}
      <form action={formAction} className="space-y-6">
        <input
          type="hidden"
          name="next"
          value={searchParams.get("next") || ""}
        />
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
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-xl font-roboto"
              required
              disabled={isPending}
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
          disabled={isPending}
        />

        {/* --- MENSAJE DE ERROR --- */}
        {state?.error && (
          <p className="text-sm text-red-600 px-2" role="alert">
            {state.error}
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
              disabled={isPending}
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
          disabled={isPending}
        >
          {isPending ? "Ingresando..." : "Iniciar Sesión"}
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

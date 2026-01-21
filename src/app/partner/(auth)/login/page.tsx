"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useActionState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loginAction } from "@/src/lib/actions/auth";
// 1. Importamos la fuente correctamente para que funcione el peso 100 (Thin)
import { Inter } from "next/font/google";

import googleLogo from "@/src/assets/images/googlelogo.svg";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import logo from "@/src/assets/images/logo.svg";

// 2. Configuramos la fuente
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "400", "700"], // Importante cargar el peso 100
  variable: "--font-inter",
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // Local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleAppleLogin = () => {
    console.log("Apple login click");
  };

  const handleGoogleLogin = () => {
    console.log("Google login click");
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login click");
  };

  useEffect(() => {
    if (state?.error) {
      setErrors({ email: state.error, password: state.error });
    }
  }, [state]);

  return (
    // Agregamos la variable de la fuente al contenedor principal
    <div
      className={`flex min-h-screen w-full bg-white font-sans text-[#484848] ${inter.variable}`}
    >
      {/* Left Side */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col items-center justify-center pt-32 px-12"
        style={{
          background: "linear-gradient(180deg, #04BD88 0%, #2E734D 100%)",
        }}
      >
        {/* 
            CAMBIOS DE ALINEACIÓN AQUÍ:
            1. Quitamos 'w-full' para que el contenedor se ajuste al texto.
            2. Mantenemos 'flex flex-col' para apilar título y párrafo.
            3. 'text-left' asegura que la "¿" y la "P" se alineen verticalmente.
            
            Como el padre (div verde) tiene 'items-center', este bloque entero
            se centrará en la pantalla, pero el texto interno se alinea a la izquierda.
        */}
        <div className="relative z-10 flex flex-col text-left mb-8">
          <h1
            className={`${inter.className} text-white font-bold text-5xl lg:text-[64px] leading-tight`}
          >
            ¿Reddi
            {/* 'block' fuerza el salto de línea para que quede abajo */}
            <span className="font-thin lg:text-[48px] leading-none">
              {" "}
              Pa’ Vender?
            </span>
          </h1>
          <p
            className={`${inter.className} text-white font-light text-xl ml-10`}
          >
            Inicia sesión y empieza a vender hoy
          </p>
        </div>

        <div className="relative w-full flex-grow">
          <Image
            src="/partners-login-phone.png"
            alt="Reddi Login Devices"
            fill
            className="object-contain object-center scale-110"
            priority
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        <div className="w-full max-w-[504px] flex flex-col items-center">
          {/* Logo */}
          <div className="w-full mb-8 flex items-center justify-start">
            <Image
              src={"/reddi.svg"}
              alt="Aliados Logo"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <span className="ml-3 text-[#47BB7E] text-4xl font-normal">
              Aliados
            </span>
          </div>

          <form action={formAction} className="w-full flex flex-col gap-6">
            <input type="hidden" name="redirectTo" value="/partner/dashboard" />

            {/* Email Field */}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-[#47BB7E] font-bold text-base mb-2"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                Email
              </label>
              <div className="relative bg-[#F4F5F7] rounded-lg">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  className="w-full h-[46px] bg-transparent border-none rounded-lg px-4 text-[#484848] text-[13px] focus:ring-2 focus:ring-[#04BD88] outline-none placeholder:text-[#484848]/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-[#47BB7E] font-bold text-base mb-2"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full h-[46px] bg-[#F4F5F7] border-none rounded-lg px-4 text-[#484848] text-[13px] focus:ring-2 focus:ring-[#04BD88] outline-none placeholder:text-[#484848]/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-[50px] bg-[#04BD88] hover:bg-[#03a373] text-white font-bold text-xl rounded-[18px] transition-colors flex justify-center items-center mt-4 shadow-lg shadow-[#04BD88]/20"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              {isPending ? "Iniciando..." : "Continuar"}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center justify-center my-6 relative">
            <div className="h-[1px] bg-[#6A6C71] w-full absolute top-1/2 left-0 transform -translate-y-1/2 opacity-30"></div>
            <span className="bg-white px-4 z-10 text-[#6A6C71] text-[10px] font-bold">
              O continua con
            </span>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4 items-center w-full justify-start">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 rounded-full pl-0 px-4 py-2 hover:bg-gray-50 transition-colors "
            >
              <div
                className="w-5 h-5 bg-no-repeat bg-center bg-contain"
                style={{ backgroundImage: `url(${googleLogo.src})` }}
              ></div>
              <span className="text-xs font-bold text-[#1C1C1C]">Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center gap-2 rounded-full pl-0 px-4 py-2 hover:bg-gray-50 transition-colors "
            >
              <div
                className="w-5 h-5 bg-no-repeat bg-center bg-contain"
                style={{ backgroundImage: `url(${facebookLogo.src})` }}
              ></div>
              <span className="text-xs font-bold text-[#1C1C1C]">Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleAppleLogin}
              className="flex items-center gap-2 rounded-full pl-0 px-4 py-2 hover:bg-gray-50 transition-colors "
            >
              <div className="w-5 h-5 flex items-center justify-center text-black">
                <AppleIcon />
              </div>
              <span className="text-xs font-bold text-[#000000]">Apple</span>
            </button>
          </div>

          {/* Footer Terms */}
          <div className="mt-2 text-[#6A6C71] text-[10px] text-left w-full justify-start">
            Al iniciar sesión, aceptas los{" "}
            <Link
              href="/terminos-y-condiciones"
              className="underline text-blue-700"
            >
              Términos de Seguridad
            </Link>{" "}
            para Comercios de Reddi.
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import AuthInput from "@/src/components/basics/auth/AuthInput";

export default function Registro() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full bg-white rounded-t-[30px] md:rounded-[46px] p-6 pb-12 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative min-h-[calc(65vh+24px)] md:min-h-[600px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto">
      {/* Toggle */}
      <div className="relative w-[222px] h-[39px] bg-[#F4F5F7] rounded-[24px] flex mb-6 mt-6 cursor-pointer select-none">
        <Link
          href="/auth/login"
          className="absolute left-0 top-0 bottom-0 w-[110px] flex items-center justify-center text-[#1C1C1C] font-bold text-[13px] z-10 transition-colors hover:text-black"
        >
          <span className="leading-[18px]">Iniciar sesión</span>
        </Link>
        <div className="absolute right-0 top-0 bottom-0 bg-[#04BD88] rounded-[24px] w-[113px] flex items-center justify-center text-white font-bold text-[13px] shadow-sm z-20">
          <span className="leading-[18px]">Regístrate</span>
        </div>
      </div>

      <div className="w-full px-4 flex flex-col gap-4">
        {/* Name & Lastname */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 w-full">
            <AuthInput label="Nombre" type="text" />
          </div>
          <div className="flex-1 w-full">
            <AuthInput label="Apellido" type="text" />
          </div>
        </div>

        {/* Email */}
        <AuthInput label="Email" type="email" />

        {/* Phone */}
        <div className="w-full mb-1">
          <AuthInput
            label="Número de teléfono"
            type="tel"
            containerClassName="px-2 gap-2"
            startIcon={
              <div className="flex items-center gap-1 min-w-[50px] border-r border-[#D1D1D1] pr-2 h-[20px]">
                <span className="text-lg leading-none">🇩🇴</span>
                <span className="text-[13px] text-[#484848] font-normal leading-[18px]">
                  +1
                </span>
                <svg
                  className="w-2 h-2 text-[#484848]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            }
          />
        </div>

        {/* Register Button */}
        <div className="w-full mb-2">
          <button className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center">
            Regístrate
          </button>
        </div>

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center my-0 select-none">
          <div className="absolute w-full h-[1px] bg-[#6A6C71] opacity-50"></div>
          <div className="z-10 bg-white px-2 rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center text-[10px] font-bold text-[#6A6C71]">
            o
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-[10px] w-full mt-2">
          <button className="w-full h-[38px] bg-[#DADADA] rounded-[24px] flex items-center justify-center gap-2 hover:bg-[#c4c4c4] transition-all">
            <div className="w-[20px] h-[20px] relative">
              <Image
                src={googleLogo}
                alt="Google"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[#1C1C1C] font-bold text-[15px]">
              Continuar con Google
            </span>
          </button>
          <button className="w-full h-[38px] bg-[#3B579D] rounded-[24px] flex items-center justify-center gap-2 hover:bg-[#2f467d] transition-all">
            <div className="w-[20px] h-[20px] relative">
              <Image
                src={facebookLogo}
                alt="Facebook"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-[15px]">
              Continuar con Facebook
            </span>
          </button>
          <button className="w-full h-[38px] bg-black rounded-[24px] flex items-center justify-center gap-2 hover:bg-gray-900 transition-all">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <AppleIcon className="w-[20px] h-[20px] text-white fill-current" />
            </div>
            <span className="text-white font-bold text-[15px]">
              Continuar con Apple
            </span>
          </button>
        </div>

        {/* Footer Text */}
        <div className="w-full text-center px-2 pb-6 pt-2">
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

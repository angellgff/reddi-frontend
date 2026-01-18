"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";

const ErrorIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-[1px]"
  >
    <circle cx="5" cy="5" r="4.5" stroke="#CF4518" />
    <path d="M5 2.5V5.5" stroke="#CF4518" strokeLinecap="round" />
    <circle cx="5" cy="7.5" r="0.5" fill="#CF4518" />
  </svg>
);

export default function Registro() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Ingresar Nombre";
    if (!formData.apellido.trim()) newErrors.apellido = "Ingresar Apellido";
    if (!formData.email.trim()) newErrors.email = "Email es requerido";
    if (!formData.telefono.trim())
      newErrors.telefono = "El número de teléfono es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      // Proceed with registration
      console.log("Form valid", formData);
      // Here you would call the API
      // If API returns "linked to existing account" errors:
      // setErrors({ telefono: "Este número está vinculado a una cuenta existente" })
      // setErrors({ email: "Este email esta registrado con una cuenta existente" })
    }
  };

  return (
    <div className="w-[calc(100%+3rem)] -mx-6 -mb-20 bg-white rounded-t-[30px] md:rounded-[46px] p-6 flex flex-col items-center shadow-none md:shadow-sm font-openSans relative overflow-hidden min-h-[calc(100vh-200px)] md:min-h-[600px] md:w-full md:max-w-[394px] md:m-0 md:mx-auto">
      {/* Toggle */}
      <div className="relative w-[222px] h-[39px] bg-[#F4F5F7] rounded-[24px] flex mb-6 mt-6 cursor-pointer select-none">
        <Link
          href="/login"
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
        <div className="flex gap-4 w-full items-start">
          <div className="flex-1 w-full flex flex-col">
            <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
              Nombre
            </label>
            <div
              className={`rounded-[8px] h-[34px] flex items-center px-4 w-full transition-colors ${
                errors.nombre
                  ? "bg-[#FFF9E9] border border-[#FFCF58]"
                  : "bg-[#F4F5F7]"
              }`}
            >
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="bg-transparent w-full text-[13px] text-[#484848] outline-none font-normal"
              />
            </div>
            {errors.nombre && (
              <span className="text-[#CF4518] text-[9px] font-semibold mt-1 flex items-center gap-1">
                <ErrorIcon /> {errors.nombre}
              </span>
            )}
          </div>
          <div className="flex-1 w-full flex flex-col">
            <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
              Apellido
            </label>
            <div
              className={`rounded-[8px] h-[34px] flex items-center px-4 w-full transition-colors ${
                errors.apellido
                  ? "bg-[#FFF9E9] border border-[#FFCF58]"
                  : "bg-[#F4F5F7]"
              }`}
            >
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="bg-transparent w-full text-[13px] text-[#484848] outline-none font-normal"
              />
            </div>
            {errors.apellido && (
              <span className="text-[#CF4518] text-[9px] font-semibold mt-1 flex items-center gap-1">
                <ErrorIcon /> {errors.apellido}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="w-full flex flex-col">
          <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
            Email
          </label>
          <div
            className={`rounded-[8px] h-[34px] flex items-center px-4 w-full transition-colors ${
              errors.email
                ? "bg-[#FFF9E9] border border-[#FFCF58]"
                : "bg-[#F4F5F7]"
            }`}
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent w-full text-[13px] text-[#484848] outline-none font-normal"
            />
          </div>
          {errors.email && (
            <span className="text-[#CF4518] text-[9px] font-semibold mt-1 flex items-center gap-1">
              <ErrorIcon /> {errors.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="w-full mb-1 flex flex-col">
          <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
            Número de teléfono
          </label>
          <div
            className={`rounded-[8px] h-[34px] flex items-center px-2 w-full gap-2 transition-colors ${
              errors.telefono
                ? "bg-[#FFF9E9] border border-[#FFCF58]"
                : "bg-[#F4F5F7]"
            }`}
          >
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
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="bg-transparent w-full text-[13px] text-[#484848] outline-none font-normal"
            />
          </div>
          {errors.telefono && (
            <span className="text-[#CF4518] text-[9px] font-semibold mt-1 flex items-center gap-1">
              <ErrorIcon /> {errors.telefono}
            </span>
          )}
        </div>

        {/* Register Button */}
        <div className="w-full mb-2 mt-4">
          <button
            onClick={handleSubmit}
            className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center"
          >
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

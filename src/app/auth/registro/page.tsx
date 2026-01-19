"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import googleLogo from "@/src/assets/images/googlelogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import Spinner from "@/src/components/basics/Spinner";
import AuthInput from "@/src/components/basics/auth/AuthInput";

import {
  checkEmailRegistered,
  checkPhoneRegistered,
  registerPhoneForUser,
} from "@/src/lib/actions/auth-checks";

function RegistroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "Ingresar Nombre";
    if (!lastName.trim()) newErrors.lastName = "Ingresar Apellido";
    if (!email.trim()) newErrors.email = "Email es requerido";
    if (!phone.trim()) newErrors.phone = "El número de teléfono es requerido";
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors.general; // Clear general error on input change
        return newErrors;
      });
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // 1. Check if email/phone exists using Server Action (bypassing public security mask)
      console.log("Checking if email/phone already registered...");
      console.log(email, phone);
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailRegistered(email),
        checkPhoneRegistered(phone),
      ]);

      const backendErrors: Record<string, string> = {};
      if (emailExists) {
        backendErrors.email =
          "Este email esta registrado con una cuenta existente";
      }
      if (phoneExists) {
        backendErrors.phone =
          "Este número está vinculado a una cuenta existente";
      }

      if (Object.keys(backendErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...backendErrors }));
        setIsLoading(false);
        return;
      }

      console.log("Proceeding with sign up...");
      console.log(phone);

      // 2. Proceed with sign up
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        console.log("Supabase SignUp Error:", error);
        if (
          error.code === "user_already_exists" ||
          error.message?.includes("already registered") ||
          error.message?.includes("User already exists")
        ) {
          setErrors((prev) => ({
            ...prev,
            email: "Este email esta registrado con una cuenta existente",
          }));
          setIsLoading(false);
          return;
        }
        throw error;
      }

      // 3. Register phone in Auth table explicitly
      if (signUpData.user?.id) {
        await registerPhoneForUser(signUpData.user.id, phone);
      }

      router.push("/auth/sign-up-success");
    } catch (error: any) {
      console.error("Error signing up:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Error al registrarse. Por favor intenta nuevamente.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="flex gap-4 w-full items-start">
          <div className="flex-1 w-full">
            <AuthInput
              label="Nombre"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearError("firstName");
              }}
              error={errors.firstName}
            />
          </div>
          <div className="flex-1 w-full">
            <AuthInput
              label="Apellido"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearError("lastName");
              }}
              error={errors.lastName}
            />
          </div>
        </div>

        {/* Email */}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
            clearError("general");
          }}
          error={errors.email}
        />

        {/* Phone */}
        <div className="w-full mb-1">
          <AuthInput
            label="Número de teléfono"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError("phone");
            }}
            error={errors.phone}
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

        {/* Password */}
        <AuthInput
          label="Contraseña"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("confirmPassword"); // Clear mismatch error when editing password
          }}
        />

        {/* Confirm Password */}
        <AuthInput
          label="Confirmar contraseña"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError("confirmPassword"); // Clear mismatch error when editing confirmation
          }}
          error={errors.confirmPassword}
        />

        {/* General Error Message */}
        {errors.general && (
          <div className="w-full p-3 bg-red-50 border border-red-100 rounded-[18px] text-center">
            <span className="text-red-500 text-xs font-medium">
              {errors.general}
            </span>
          </div>
        )}

        {/* Register Button */}
        <div className="w-full mb-2">
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full h-[50px] bg-[#04BD88] rounded-[18px] text-white font-bold text-[20px] leading-[18px] hover:bg-[#03a072] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : "Regístrate"}
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

export default function Registro() {
  return (
    <Suspense fallback={<div></div>}>
      <RegistroContent />
    </Suspense>
  );
}

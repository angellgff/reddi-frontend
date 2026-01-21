"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useActionState, useEffect } from "react";
import { loginAction } from "@/src/lib/actions/auth";

import googleLogo from "@/src/assets/images/googlelogo.svg";
import facebookLogo from "@/src/assets/images/facebooklogo.svg";
import AppleIcon from "@/src/components/icons/AppleIcon";
import logo from "@/src/assets/images/logo.svg";

import PartnerAuthInput from "./PartnerAuthInput";
import PartnerSubmitButton from "./PartnerSubmitButton";
import PartnerSocialButton from "./PartnerSocialButton";

export default function LoginForm() {
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
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
      <div className="w-full max-w-[504px] flex flex-col items-center">
        {/* Logo */}
        <div className="w-full mb-8 flex items-center justify-start">
          <Image
            src={logo}
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
          <PartnerAuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="ejemplo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={errors.email}
          />

          {/* Password Field */}
          <PartnerAuthInput
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={errors.password}
          />

          {/* Continue Button */}
          <PartnerSubmitButton isPending={isPending} />
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
          <PartnerSocialButton
            onClick={handleGoogleLogin}
            label="Google"
            icon={
              <div
                className="w-full h-full bg-no-repeat bg-center bg-contain"
                style={{ backgroundImage: `url(${googleLogo.src})` }}
              />
            }
          />

          <PartnerSocialButton
            onClick={handleFacebookLogin}
            label="Facebook"
            icon={
              <div
                className="w-full h-full bg-no-repeat bg-center bg-contain"
                style={{ backgroundImage: `url(${facebookLogo.src})` }}
              />
            }
          />

          <PartnerSocialButton
            onClick={handleAppleLogin}
            label="Apple"
            icon={<AppleIcon />}
          />
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
  );
}

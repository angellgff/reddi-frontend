"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/src/lib/actions/auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import ReddiIcon from "@/src/components/icons/ReddiIcon"; // Asegúrate de que el import sea correcto
import { Loader2 } from "lucide-react";
// 1. Importamos la fuente Inter
import { Inter } from "next/font/google";

// 2. Inicializamos la fuente
const inter = Inter({ subsets: ["latin"] });

export default function DeliveryLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col font-sans overflow-x-hidden">
      {/* Top Green Section */}
      <div
        className="relative h-[410px] w-full bg-gradient-to-b from-[#04BD88] to-[#2E734D] flex flex-col items-center overflow-hidden shrink-0"
        style={{
          background: "linear-gradient(180deg, #04BD88 0%, #2E734D 100%)",
        }}
      >
        {/* Background Watermark/Decoration */}
        <div className="absolute top-[-85%] left-[-20%] transform rotate-[29deg] pointer-events-none">
          <ReddiIcon className="w-[600px] h-auto text-white" fill="#ffffff" />
        </div>

        {/* Main Text - SECCIÓN ACTUALIZADA */}
        {/* Usamos un wrapper absolute para posicionarlo sobre el fondo verde */}
        <div className="absolute top-[320px] left-4 right-0 pl-4 w-full">
          <div className="relative z-10 flex flex-col text-left mb-4 flex-shrink-0">
            <h1
              className={`${inter.className} text-white font-bold text-4xl xl:text-[64px] leading-tight`}
            >
              ¿Reddi
              <span className="font-thin xl:text-[48px] leading-none">
                {" "}
                Pa’ Vender?
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Inputs Section */}
      <form
        action={formAction}
        className="w-full max-w-md mx-auto px-6 mt-6 flex flex-col gap-5 z-20"
      >
        <div>
          <label
            className="block text-[13px] font-bold mb-1 ml-1"
            htmlFor="email"
          >
            Email
          </label>
          <div className="bg-[#F4F5F7] rounded-lg p-1">
            <Input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-[34px] text-[16px] px-3"
              placeholder=""
              required
            />
          </div>
        </div>

        <div>
          <label
            className="block text-[13px] font-bold mb-1 ml-1"
            htmlFor="password"
          >
            Contraseña
          </label>
          <div className="bg-[#F4F5F7] rounded-lg p-1">
            <Input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-[34px] text-[16px] px-3"
              placeholder=""
              required
            />
          </div>
        </div>

        {state?.error && (
          <div className="text-red-500 text-sm px-1">{state.error}</div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-center w-full">
          <Button
            type="submit"
            className="bg-[#04BD88] hover:bg-[#03a072] text-white rounded-[18px] w-full h-[50px] text-[20px] font-bold shadow-md"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Continuar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { UserRound } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";

export default function PartnerForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        },
      );

      if (resetError) throw resetError;
      setSuccess(true);
      setEmail("");
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocurrió un error al enviar el enlace de recuperación.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex w-full  items-center justify-center  bg-gradient-to-b from-[#041D15] to-[#13835F] h-[100vh]">
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 lg:flex-row lg:gap-[30px]">
          <section className="flex w-full max-w-[655px] flex-1 flex-col justify-center rounded-[20px] bg-white px-5 py-8 sm:px-9 sm:py-12 lg:h-[624px] lg:gap-12">
            <div className="flex justify-center">
              <Image
                src="/logoaaaaaa.svg"
                alt="Reddi"
                width={106}
                height={36}
                className="h-[35px] w-auto brightness-0 opacity-60"
                priority
              />
            </div>

            <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="space-y-2 text-center">
                <h1 className="text-[28px] font-openSans font-bold leading-8 text-black md:text-[28px] md:leading-[32px]">
                  Has olvidado tu contraseña
                </h1>
                <p className="mx-auto max-w-[583px] text-sm font-medium leading-5 text-[#6A6C71] md:text-base">
                  Por favor ingresa el correo electrónico de usuario para
                  restablecer la contraseña
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="partner-forgot-email"
                  className="block text-sm font-medium leading-[18px] text-black"
                >
                  Correo electrónico
                </label>

                <div className="flex h-14 items-center gap-2 rounded-[12px] border border-[#9BA1AE] bg-white px-4">
                  <UserRound className="h-6 w-6 text-black" strokeWidth={2} />
                  <input
                    id="partner-forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Ingresa la información"
                    required
                    className="h-full w-full border-0 bg-transparent text-base text-[#6A6C71] placeholder:text-[#6A6C71]/50 focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && (
                  <p className="text-sm text-emerald-700">
                    Te enviamos un enlace de recuperación a tu correo.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-9 w-full items-center justify-center rounded-[12px] bg-[#595959] px-5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading
                  ? "Enviando enlace..."
                  : "Enviar enlace de recuperación"}
              </button>

              <Link
                href="/partner/login"
                className="text-center text-sm font-medium text-[#6A6C71] underline"
              >
                Volver a iniciar sesión
              </Link>
            </form>
          </section>

          <section className="hidden h-full w-full max-w-[655px] flex-1 items-center justify-center p-2 lg:flex lg:p-0">
            <div className="relative h-full max-h-[700px] w-full overflow-hidden rounded-[40px]">
              <Image
                src="/new-design/nd-forgot-password.png"
                alt="Recuperación de contraseña para partners"
                fill
                priority
                className="object-cover"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

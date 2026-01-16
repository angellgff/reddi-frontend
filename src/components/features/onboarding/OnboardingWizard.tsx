"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { completeOnboarding } from "@/src/lib/actions/onboarding";
import { cn } from "@/src/lib/utils";

const steps = [
  {
    image: "/onboard-1.png",
    title: "Todo al instante, desde donde estés.",
    description:
      "Compra fácil y recibe rápido. Reddi reúne tus productos favoritos en un solo toque.",
  },
  {
    image: "/onboard-2.png",
    title: "Entrega rápida, justo a tu puerta.",
    description:
      "Pide fácilmente desde tu celular y recibe en solo minutos. ¡Solo crea tu cuenta gratuita y empieza ahora mismo!",
  },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await completeOnboarding();
        const nextPath = searchParams.get("next") ?? "/";
        router.push(nextPath);
        router.refresh();
      } catch (error) {
        console.error("Failed to complete onboarding", error);
        router.push("/user/home");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-white font-openSans md:flex md:items-center md:justify-center md:bg-gray-50 md:p-6">
      <div className="relative flex min-h-screen w-full flex-col justify-between bg-white transition-all md:min-h-[600px] md:h-auto md:w-full md:max-w-5xl md:flex-row md:overflow-hidden md:rounded-3xl md:shadow-xl lg:min-h-[650px]">
        {/* Splash Screen Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ease-in-out absolute",
            showSplash
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          )}
        >
          <div className="relative h-40 w-40 animate-pulse">
            <Image
              src="/reddi.svg"
              alt="Reddi"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 
          CAMBIOS REALIZADOS EN ESTA SECCIÓN:
          1. h-[50vh]: Fuerza la altura al 50% de la pantalla en móvil.
          2. p-0: Elimina el padding en móvil para que la imagen toque los bordes.
          3. md:...: Restaura los valores originales para escritorio.
        */}
        <div className="flex h-[50vh] w-full flex-col items-center justify-center bg-white p-0 md:h-auto md:w-1/2 md:flex-1 md:bg-[#F8F9FA] md:p-12 md:pt-12">
          {/* 
            CAMBIOS EN EL WRAPPER DE LA IMAGEN:
            1. h-full w-full: Ocupa todo el espacio del contenedor padre (50vh).
            2. rounded-none: Quita los bordes redondeados en móvil.
            3. max-w-none: Permite que la imagen se expanda completamente.
            4. md:aspect... md:rounded...: Restaura el estilo de "tarjeta" en escritorio.
          */}
          <div className="relative h-full w-full overflow-hidden rounded-none shadow-none transition-all md:aspect-[347/366] md:h-auto md:max-w-[400px] md:rounded-[20px] md:shadow-sm">
            <Image
              src={step.image}
              alt="Onboarding"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right Section: Content Area */}
        {/* Agregamos min-h-[50vh] para asegurar que ocupe el resto de la pantalla en móvil */}
        <div className="flex min-h-[50vh] w-full flex-col justify-center px-6 pb-8 pt-8 md:min-h-0 md:w-1/2 md:p-12 lg:p-20">
          <div className="mx-auto w-full max-w-md">
            {/* Indicators */}
            <div className="mb-8 flex gap-3">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-all duration-300",
                    idx === currentStep ? "bg-[#FFCF58] w-8" : "bg-[#D5DEE7]"
                  )}
                />
              ))}
            </div>

            {/* Text */}
            <div className="mb-12 md:mb-16">
              <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[#292D32] md:text-4xl lg:text-[40px]">
                {step.title}
              </h1>
              <p className="text-lg leading-relaxed text-[#6A798A] md:text-xl">
                {step.description}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex h-[56px] w-[100px] items-center justify-center rounded-[18px] bg-gray-100 text-[18px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Atrás
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={loading}
                className="flex h-[56px] flex-1 items-center justify-center rounded-[18px] bg-[#04BD88] text-[20px] font-bold text-white transition-all hover:bg-[#03A073] hover:shadow-lg disabled:opacity-70 disabled:hover:shadow-none"
                style={{
                  boxShadow: loading
                    ? "none"
                    : "0px 4px 10px rgba(4, 189, 136, 0.2)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando...
                  </span>
                ) : (
                  "Continuar"
                )}
                {!loading && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { completeOnboarding } from "@/src/lib/actions/onboarding";
import { cn } from "@/src/lib/utils";

const steps = [
  {
    image: "/landing-woman.png",
    title: "Todo al instante, desde donde estés.",
    description:
      "Compra fácil y recibe rápido. Reddi reúne tus productos favoritos en un solo toque.",
  },
  {
    image: "/market.png", // Using market.png as placeholder for the delivery image
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
        // If it fails, we might still want to let them in or show error
        // For now, let's try to proceed
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
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-white px-6 pb-8 pt-12 font-openSans md:mx-auto md:max-w-md md:border-x md:border-gray-100">
      {/* Splash Screen Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ease-in-out md:absolute",
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

      {/* Image Area */}
      <div className="flex w-full flex-1 flex-col items-center justify-center pt-8">
        <div className="relative aspect-[347/366] w-full max-w-[347px] overflow-hidden rounded-[20px]">
          <Image
            src={step.image}
            alt="Onboarding"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full">
        {/* Indicators */}
        <div className="mb-6 flex gap-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors duration-300",
                idx === currentStep ? "bg-[#FFCF58]" : "bg-[#D5DEE7]"
              )}
            />
          ))}
        </div>

        {/* Text */}
        <div className="mb-10">
          <h1 className="mb-4 text-[36px] font-medium leading-[1.2] tracking-tight text-[#292D32]">
            {step.title}
          </h1>
          <p className="text-[17px] leading-[1.4] text-[#6A798A]">
            {step.description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex h-[50px] w-[100px] items-center justify-center rounded-[18px] bg-gray-100 text-[18px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
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
            className="flex h-[50px] flex-1 items-center justify-center rounded-[18px] bg-[#04BD88] text-[20px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            style={{ boxShadow: "0px 4px 10px rgba(4, 189, 136, 0.2)" }}
          >
            {loading ? (
              <span className="animate-pulse">Procesando...</span>
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
  );
}

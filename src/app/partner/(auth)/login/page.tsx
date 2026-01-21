"use client";

import LoginHero from "@/src/components/features/partner/auth/LoginHero";
import LoginForm from "@/src/components/features/partner/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full bg-white font-sans text-[#484848] overflow-hidden">
      <LoginHero />
      <LoginForm />
    </div>
  );
}

"use client";

import LoginHero from "@/src/components/features/partner/auth/LoginHero";
import LoginForm from "@/src/components/features/partner/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-[#484848]">
      <LoginHero />
      <LoginForm />
    </div>
  );
}

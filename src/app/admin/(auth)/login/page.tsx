import { Suspense } from "react";
import LoginForm from "@/src/components/basics/auth/LoginForm";
import Image from "next/image";
import logo from "@/src/assets/images/logo.svg";

export default function LoginPage() {
  return (
    <>
      <div className="md:w-3/4 lg:w-1/2">
        <Image src={logo} alt="logo text" className="my-6 mx-auto" />
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm title="Controla y organiza todo desde aquí." />
        </Suspense>
      </div>
    </>
  );
}

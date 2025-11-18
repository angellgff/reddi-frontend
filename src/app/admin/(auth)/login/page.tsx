import LoginForm from "@/src/components/basics/auth/LoginForm";
import Image from "next/image";
import logo from "@/src/assets/images/logo.svg";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <>
      <div className="md:w-3/4 lg:w-1/2">
        <Image src={logo} alt="logo text" className="my-6 mx-auto" />
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <LoginForm title="Controla y organiza todo desde aquí." />
        </Suspense>
      </div>
    </>
  );
}

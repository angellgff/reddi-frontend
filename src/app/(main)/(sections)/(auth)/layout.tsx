import Image from "next/image";
import loginImage from "@/src/assets/images/loginUser.svg";
import logo from "@/src/assets/images/logo.svg";
import { Suspense } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="flex flex-col items-center p-6 pb-20 md:flex-row-reverse md:p-6 min-h-screen bg-[#ECEFF0]">
        <div className="relative w-full md:w-3/4 md:aspect-square aspect-video ">
          <Image
            priority={true}
            src={loginImage}
            alt="login del usuario"
            fill={true}
            className="object-cover  rounded-2xl md:rounded-[32px]"
          ></Image>
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <Image src={logo} alt="logo text" className="my-6" />
          <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>
        </div>
      </section>
    </>
  );
}

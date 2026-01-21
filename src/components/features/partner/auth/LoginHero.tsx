import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "400", "700"],
  variable: "--font-inter",
});

export default function LoginHero() {
  return (
    <div
      className={`hidden lg:flex w-1/2 relative flex-col items-center justify-center pt-32 px-12 ${inter.variable}`}
      style={{
        background: "linear-gradient(180deg, #04BD88 0%, #2E734D 100%)",
      }}
    >
      <div className="relative z-10 flex flex-col text-left mb-8">
        <h1
          className={`${inter.className} text-white font-bold text-5xl lg:text-[64px] leading-tight`}
        >
          ¿Reddi
          <span className="font-thin lg:text-[48px] leading-none">
            {" "}
            Pa’ Vender?
          </span>
        </h1>
        <p className={`${inter.className} text-white font-light text-xl ml-10`}>
          Inicia sesión y empieza a vender hoy
        </p>
      </div>

      <div className="relative w-full flex-grow">
        <Image
          src="/partners-login-phone.png"
          alt="Reddi Login Devices"
          fill
          className="object-contain object-center scale-110"
          priority
        />
      </div>
    </div>
  );
}

import Image from "next/image";
import GuestFooter from "@/src/components/features/layout/GuestFooter";
import loginPartner from "@/src/assets/images/loginPartner.svg";

export default function PartnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="flex flex-col items-center justify-center md:justify-start p-6 md:flex-row-reverse md:p-6 min-h-screen bg-gradient-to-b from-[#E6FFF5] to-white">
        <div className="relative w-full md:w-3/4 md:aspect-square aspect-video">
          <Image
            priority={true}
            src={loginPartner}
            alt="login del aliado"
            fill={true}
            className="object-cover md:rounded-[32px] rounded-2xl"
          />
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          {children}
        </div>
      </section>
      <GuestFooter />
    </>
  );
}

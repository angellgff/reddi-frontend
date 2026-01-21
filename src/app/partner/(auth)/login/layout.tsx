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
      <section className="flex flex-col items-center justify-center md:justify-start  md:flex-row-reverse  min-h-screen bg-gradient-to-b from-[#E6FFF5] to-white">
        <div className="flex flex-col items-center gap-4 w-full">
          {children}
        </div>
      </section>
    </>
  );
}

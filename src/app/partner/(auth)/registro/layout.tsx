import GuestFooter from "@/src/components/features/layout/GuestFooter";
import PartnerRegisterHeader from "@/src/components/features/partner/PartnerRegisterHeader";

export default function PartnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PartnerRegisterHeader />
      <section className="mt-[74px] min-h-screen bg-gradient-to-b from-[#E6FFF5] to-white border-t border-primary px-3 md:px-12 flex items-center">
        <div className="grow">{children}</div>
      </section>
      <GuestFooter />
    </>
  );
}

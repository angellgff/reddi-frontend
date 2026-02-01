"use client";

import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function DeliveryLayoutClient({
  children,
  header,
  footer,
}: Props) {
  const pathname = usePathname();

  // Ocultar header/footer en /repartidor/orders/xyz
  const isOrderDetail = pathname?.startsWith("/repartidor/orders/");

  return (
    <>
      {!isOrderDetail && header}
      <main
        className={`bg-[#ECEFF0] min-h-screen ${!isOrderDetail ? "pb-20 md:pb-0" : ""}`}
      >
        {children}
      </main>
      {!isOrderDetail && footer}
    </>
  );
}

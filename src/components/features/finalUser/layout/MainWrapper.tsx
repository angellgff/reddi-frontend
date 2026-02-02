"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if we are in the store details page
  const isStorePage =
    pathname?.startsWith("/user/stores/") ||
    pathname?.startsWith("/user/orders/") ||
    pathname === "/user/checkout/payment";

  // Default padding for header
  const paddingClass = isStorePage
    ? "pt-0 pb-10"
    : "pt-[4rem] sm:pt-[1rem] pb-10";

  return <main className={`${paddingClass}`}>{children}</main>;
}

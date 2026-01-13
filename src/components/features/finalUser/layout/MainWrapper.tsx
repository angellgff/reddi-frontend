"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if we are in the store details page
  const isStorePage = pathname?.startsWith("/user/stores/");

  // Default padding for header
  const paddingClass = isStorePage ? "pt-0" : "pt-[4rem] sm:pt-[1rem]";

  return (
    <main className={`${paddingClass} pb-[4.45rem] md:pb-0`}>{children}</main>
  );
}

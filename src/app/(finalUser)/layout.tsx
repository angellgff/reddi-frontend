// Tu archivo: UserLayout.tsx

import { Suspense } from "react";
import UserHeaderServer from "@/src/components/features/finalUser/header/UserHeaderServer";
import UserHeaderSkeleton from "@/src/components/features/finalUser/header/UserHeaderSkeleton";
import UserFooter from "@/src/components/basics/UserFooter";
import UserAddressesHydratorServer from "@/src/components/features/finalUser/addresses/UserAddressesHydratorServer";
import UserDefaultPaymentHydratorServer from "@/src/components/features/finalUser/payments/UserDefaultPaymentHydratorServer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserAddressesHydratorServer />
      <UserDefaultPaymentHydratorServer />
      <Suspense fallback={<UserHeaderSkeleton />}>
        <UserHeaderServer />
      </Suspense>
      <main className="pt-[9rem] sm:pt-[1rem] pb-[4.45rem] md:pb-0">
        {children}
      </main>
      <UserFooter />
    </>
  );
}

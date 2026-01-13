// Tu archivo: UserLayout.tsx

import { Suspense } from "react";
import UserHeaderServer from "@/src/components/features/finalUser/header/UserHeaderServer";
import UserHeaderSkeleton from "@/src/components/features/finalUser/header/UserHeaderSkeleton";
import UserFooter from "@/src/components/basics/UserFooter";
import UserAddressesHydratorServer from "@/src/components/features/finalUser/addresses/UserAddressesHydratorServer";
import UserDefaultPaymentHydratorServer from "@/src/components/features/finalUser/payments/UserDefaultPaymentHydratorServer";
import GuestFooter from "@/src/components/features/layout/GuestFooter";
import RouteFloatingResetter from "@/src/components/features/finalUser/layout/RouteFloatingResetter";
import CartSlider from "@/src/components/features/finalUser/cartSlider/CartSlider";

import MainWrapper from "@/src/components/features/finalUser/layout/MainWrapper";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RouteFloatingResetter />
      <UserAddressesHydratorServer />
      <UserDefaultPaymentHydratorServer />
      <Suspense fallback={<UserHeaderSkeleton />}>
        <UserHeaderServer />
      </Suspense>
      <MainWrapper>{children}</MainWrapper>
      <Suspense fallback={null}>
        <UserFooter />
      </Suspense>
      <div className="pt-0 md:pt-[4.45rem]">
        {" "}
        <GuestFooter />
      </div>
      <CartSlider />
    </>
  );
}

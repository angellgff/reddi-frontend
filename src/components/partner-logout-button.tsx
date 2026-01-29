"use client";

import { partnerLogoutAction } from "@/src/lib/actions/auth";
import { Button } from "@/src/components/ui/button";

interface PartnerLogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function PartnerLogoutButton({
  className,
  children,
}: PartnerLogoutButtonProps) {
  return (
    <Button
      onClick={async () => {
        await partnerLogoutAction();
      }}
      className={className || "hover:bg-emerald-800"}
    >
      {children || "Logout"}
    </Button>
  );
}

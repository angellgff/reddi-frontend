"use client";

import { logoutAction } from "@/src/lib/actions/auth";
import { Button } from "@/src/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      onClick={async () => {
        await logoutAction();
      }}
      className="hover:bg-emerald-800"
    >
      Logout
    </Button>
  );
}

import React, { Suspense } from "react";
import RegisterWizard from "@/src/components/features/auth/register/RegisterWizard";

export default function Celular() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterWizard />
      </Suspense>
    </>
  );
}

//<LoginForm title="Controla y organiza todo desde aquí." />

import { Suspense } from "react";
import PartnerRegisterWizard from "@/src/components/features/partner/register/PartnerRegisterWizard";

export default function RegisterPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PartnerRegisterWizard />
      </Suspense>
    </>
  );
}

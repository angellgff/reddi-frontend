//<LoginForm title="Controla y organiza todo desde aquí." />

import PartnerRegisterWizard from "@/src/components/features/partner/register/PartnerRegisterWizard";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <>
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <PartnerRegisterWizard />
      </Suspense>
    </>
  );
}

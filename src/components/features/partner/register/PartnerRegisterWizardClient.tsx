"use client";

import { useEffect, useState } from "react";
import PartnerRegisterWizard from "./PartnerRegisterWizard";

export default function PartnerRegisterWizardClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Cargando formulario...</div>;
  }

  return <PartnerRegisterWizard />;
}

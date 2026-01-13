import { Suspense } from "react";
import OnboardingWizard from "@/src/components/features/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <OnboardingWizard />
    </Suspense>
  );
}

import { Suspense } from "react";
import LoginClient from "@/src/components/main-auth/LoginClient";

// Server wrapper page: render client LoginClient inside Suspense
export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}

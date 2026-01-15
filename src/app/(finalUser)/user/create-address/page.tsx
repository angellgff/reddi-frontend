import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateAddressForm from "@/src/components/features/finalUser/createAddress/CreateAddressForm";

export default async function CreateAddressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Double check if user already has addresses, in case they manually navigated here
  // If they have addresses, they typically shouldn't be forced into this specific onboarding flow
  // unless they want to add a new one. But the requirement says "if no address registered, ONLY can see this page"
  // so if they DO have an address, we might redirect them to home, or just let them add another.
  // For now let's just render the page.

  return (
    <div className="min-h-screen bg-white relative">
      <CreateAddressForm userId={user.id} />
    </div>
  );
}

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileCreateAddressForm from "@/src/components/features/finalUser/profile/address/ProfileCreateAddressForm";

export default async function ProfileCreateAddressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="bg-white min-h-screen">
      <ProfileCreateAddressForm userId={user.id} />
    </div>
  );
}

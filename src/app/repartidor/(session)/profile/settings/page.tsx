import { createClient } from "@/src/lib/supabase/server";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialData = {
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    birthDate: "",
  };

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone_number")
      .eq("id", user.id)
      .single();

    if (profile) {
      initialData = {
        ...initialData,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone_number || "",
        // Birth date is not yet in the schema, using default empty
      };
    }
  }

  return <SettingsPageClient initialData={initialData} />;
}

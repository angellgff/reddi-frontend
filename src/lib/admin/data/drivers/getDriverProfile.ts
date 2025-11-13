import { createClient } from "@/src/lib/supabase/server";

export type DriverProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string;
};

export async function getDriverProfile(
  id: string
): Promise<DriverProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone_number, role")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getDriverProfile]", error);
    return null;
  }
  return data as DriverProfileRow;
}

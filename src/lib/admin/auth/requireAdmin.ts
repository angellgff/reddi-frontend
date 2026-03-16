import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

const getHomeUrlForRole = (role: string | null) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "market":
      return "/partner/market/dashboard";
    case "restaurant":
      return "/partner/restaurant/dashboard";
    case "delivery":
      return "/repartidor/home";
    case "user":
    default:
      return "/user/home";
  }
};

export async function requireAdminUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || null;
  if (role !== "admin") {
    redirect(getHomeUrlForRole(role));
  }

  return { supabase, user };
}

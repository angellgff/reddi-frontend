import { createClient } from "@/src/lib/supabase/server";
import { getUserProfile } from "@/src/lib/finalUser/profile/actions";
import Link from "next/link";
import SettingsClientHooks from "@/src/components/features/finalUser/profile/settings/SettingsClientHooks";
import SettingsForm from "@/src/components/features/finalUser/profile/settings/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [
    { user: profile },
    {
      data: { user: authUser },
    },
  ] = await Promise.all([getUserProfile(), supabase.auth.getUser()]);

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const email = authUser?.email || profile?.email || "";
  const phone = profile?.phone_number || "";

  return (
    <>
      <SettingsClientHooks />

      {/* Desktop Placeholder */}
      <div className="hidden md:block mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl font-semibold">Ajustes</h1>
        <p className="text-sm text-gray-600 mt-2">
          Gestiona tus ajustes de perfil.
        </p>
        <Link
          href="/user/profile/edit"
          className="text-emerald-600 hover:underline mt-4 block"
        >
          Editar Perfil
        </Link>
      </div>

      {/* Mobile View */}
      <SettingsForm
        initialValues={{
          fullName,
          email,
          phone,
          birthDate: "", // Placeholder
        }}
      />
    </>
  );
}

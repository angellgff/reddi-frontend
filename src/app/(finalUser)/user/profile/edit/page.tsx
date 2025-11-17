import { createClient } from "@/src/lib/supabase/server";
import { getUserProfile } from "@/src/lib/finalUser/profile/actions";
import EditProfileForm from "@/src/components/features/finalUser/profile/EditProfileForm";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const [
    { user: p },
    {
      data: { user: authUser },
    },
  ] = await Promise.all([getUserProfile(), supabase.auth.getUser()]);

  const fullName = [p?.first_name, p?.last_name].filter(Boolean).join(" ");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
          Editar perfil
        </h1>
        <p className="text-sm md:text-base text-neutral-600 mt-1">
          Actualiza tu información personal
        </p>
      </div>

      <EditProfileForm
        initial={{
          full_name: fullName,
          email: authUser?.email || p?.email || "",
          phone: p?.phone_number || "",
        }}
      />
    </div>
  );
}

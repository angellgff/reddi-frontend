// components/Header.tsx

"use client";
import Link from "next/link";
import Logo from "@/src/components/basics/Logo";
import Image from "next/image";
import Avatar from "@/public/carlosAvatar.svg";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import LogoutHeaderIcon from "@/src/components/icons/LogoutHeaderIcon";
import { useRouter } from "next/navigation";

const logoFill = "white";
const logoURL = "/repartidor/home";

export default function Header() {
  const [displayName, setDisplayName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      const meta = (user?.user_metadata as Record<string, any>) || {};
      const name =
        meta.full_name ||
        meta.name ||
        meta.first_name ||
        (typeof user?.email === "string" ? user.email.split("@")[0] : null) ||
        "Repartidor";
      setDisplayName(name as string);
    });
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return;
      }
      // Redirect to auth login page after successful sign out
      router.push("/login");
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  return (
    <>
      <header
        className={`
        relative px-4 py-3
        text-white
        rounded-b-3xl shadow-lg
        pt-safe 
        overflow-hidden
      `} // INSTALAR EL PLUGIN PARA EL PTSAFE
      >
        <div
          className="
          absolute inset-0
          bg-primary
          -z-10
        "
        >
          <div
            className="
            absolute inset-0
            bg-pattern-food
            bg-repeat
            opacity-20
           bg-[length:750px]
          "
          ></div>
        </div>
        <div className="flex flex-col p-4">
          {/* --- Fila Superior: Usuario e Imagen --- */}
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              {/* Lado Izquierdo: Logo y bienvenida*/}
              <Link href={logoURL}>
                <Logo fill={logoFill} />
              </Link>
              <p className="block font-bold">
                Hola, {displayName || "Repartidor"} 👋
              </p>
            </div>

            {/* Lado Derecho: Imagen de repartidor */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={Avatar}
                  alt="Foto de perfil de usuario"
                  fill={true}
                />
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-md text-sm"
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="relative"
              title="Cerrar sesión"
            >
              <LogoutHeaderIcon fill="white" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

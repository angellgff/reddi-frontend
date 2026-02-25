import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function PartnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full flex-col overflow-hidden bg-white">
        <header className="flex h-[104px] items-center justify-between border-b border-[#595959] px-4 md:px-[50px]">
          <div className="flex items-center gap-3">
            <Image
              src="/reddi.svg"
              alt="Reddi"
              width={34}
              height={34}
              className="h-8 w-auto"
              priority
            />
            <span className="text-3xl font-semibold leading-none text-[#13835F]">
              Aliados
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-lg font-semibold text-[#222222] md:inline">
              ¿Ya tienes cuenta?
            </span>
            <Link
              href="/partner/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#13835F] px-5 text-sm font-medium text-white"
            >
              <LogIn className="h-5 w-5" />
              Iniciar Sesión
            </Link>
          </div>
        </header>

        <section className="flex flex-1 justify-center bg-gradient-to-b from-[#041D15] to-[#13835F] px-4 md:px-[50px] ">
          <div className="h-full w-full max-w-[1340px] p-3 md:p-6">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

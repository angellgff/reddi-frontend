import Image from "next/image";
import { Suspense } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row-reverse bg-[#04BD88]">
      {/* 
        Image Section:
        - Mobile: Takes top ~35-40% of screen height.
        - Desktop: Takes right half of screen.
      */}
      <div className="relative w-full h-[35vh] min-h-[250px] md:h-screen md:w-1/2 lg:w-1/2 shrink-0">
        <Image
          priority
          src="/login-image.png"
          alt="Auth background"
          fill
          className="object-cover object-top md:object-center"
        />
      </div>

      {/* 
        Content Section:
        - Mobile: Pulls up via negative margin to overlap image. Fills bottom.
        - Desktop: Centered on left side, white background handled by content or wrapper.
      */}
      <div className="flex-1 w-full flex flex-col md:justify-center relative z-10 -mt-6 md:mt-0 md:bg-white md:rounded-r-[32px] md:rounded-l-none md:overflow-hidden">
        <div className="w-full h-full md:h-auto flex flex-col md:items-center md:justify-center">
          <Suspense
            fallback={
              <div className="p-4 text-white md:text-black">Cargando...</div>
            }
          >
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// components/promotions/PromoCardSkeleton.tsx

export default function PromoCardSkeleton({
  variant = "mobile",
}: {
  variant?: "mobile" | "desktop";
}) {
  const containerSizeClass =
    variant === "desktop" ? "w-[317px] h-[146px]" : "w-[23rem] h-40";
  return (
    <div
      className={`
        relative
        ${containerSizeClass}
        flex-shrink-0
        rounded-2xl
        shadow-md
        overflow-hidden/* Color base para el fondo */
      `}
      aria-label="Cargando promoción"
    >
      <div
        className={`
          relative z-10
          h-full w-full
          flex flex-col justify-center p-4
          shadow-md
        `}
      >
        {/* Contenedor para la animación y los placeholders de texto */}
        <div className="relative animate-pulse">
          {/* Placeholder para el Título (h3) */}
          <div className="h-4 w-3/5 rounded bg-skeleton"></div>

          {/* Placeholders para el Subtítulo y Código (p) */}
          <div className="mt-2 space-y-1.5">
            <div className="h-3 w-4/5 rounded bg-skeleton"></div>
            <div className="h-3 w-2/3 rounded bg-skeleton"></div>
          </div>

          {/* Placeholder para el Botón (div) */}
          <div className="mt-4 h-9 w-28 rounded-full bg-skeleton"></div>
        </div>
      </div>
    </div>
  );
}

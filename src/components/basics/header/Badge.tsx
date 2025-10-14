// Pequeño componente para las insignias (badges) de notificación
export default function Badge({
  count = 1,
  color = "bg-red-500",
  className = "",
  hideZero = true,
}: {
  count?: number;
  color?: string;
  className?: string;
  hideZero?: boolean;
}) {
  // Always render span to keep SSR/CSR markup stable and avoid hydration mismatches
  const zeroHiddenClass =
    count === 0 && hideZero ? "opacity-0 pointer-events-none" : "";
  return (
    <span
      aria-hidden={count === 0}
      data-count={count}
      // When server count differs from client (e.g., cart populated client-side), avoid noisy hydration warning.
      suppressHydrationWarning
      className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center ${color} text-xs text-white ${zeroHiddenClass} ${className}`}
    >
      {count}
    </span>
  );
}

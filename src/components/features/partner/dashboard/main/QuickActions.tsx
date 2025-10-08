import Link from "next/link";

// NOTE: Server Component compatible (no client directive needed) because we removed event handlers.
export default function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="font-roboto font-semibold">Acciones rápidas</h2>
      <Link
        href="/aliado/productos/nuevo"
        className="inline-block bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-2 text-sm font-medium transition-colors"
      >
        Añadir nuevo producto
      </Link>
    </div>
  );
}

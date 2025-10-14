"use client";

// Importar el tipo real desde el fetch server-side.
// El tipo original tiene: id, name, image_url, address, partner_type
import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";

// Extendemos el tipo para permitir nuevos campos opcionales sin romper.
type ExtendedStoreDetails = BaseStoreDetails & {
  banner_url?: string | null;
  logo_url?: string | null;
  rating?: number | null;
  phone?: string | null;
  delivery_time?: string | null;
};

export default function StoreHeader({
  store,
}: {
  store: ExtendedStoreDetails;
}) {
  const banner = store.banner_url || store.image_url || "";
  const logo = store.logo_url || store.image_url || "";
  const rating = store.rating ?? 4.8; // placeholder si no existe
  const phone = store.phone || "--";
  const deliveryTime = store.delivery_time || "25-35 min"; // fallback

  return (
    // 1. El contenedor principal ya es 'relative', lo que es perfecto.
    <div className="rounded-2xl overflow-hidden shadow-sm bg-white relative">
      {/* Banner */}
      <div className="relative h-36 md:h-48 w-full bg-gray-100">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`${store.name} banner`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {/* El gradiente puede ser opcional si la imagen ya es oscura */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* 2. Logo superpuesto */}
      <div className="absolute left-6 top-24 md:left-20 md:top-40 z-10">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={store.name}
            // 3. Clases clave para el logo
            className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-primary shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gray-200 ring-1 ring-primary shadow-lg" />
        )}
      </div>

      {/* 4. Fila de información */}
      <div className="px-5 py-4 flex flex-col md:flex-row md:items-end gap-4">
        {/* 5. Contenedor de texto con padding a la izquierda para no chocar con el logo */}
        <div className="md:pl-[240px] w-full">
          <h1 className="text-2xl font-bold">{store.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center font-semibold">
              ⭐ {rating}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEF6FF] text-[#1C398E] border border-[#BEDBFF]">
              {deliveryTime}
            </span>
          </div>

          {/* Dirección y Teléfono */}
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            {store.address && (
              <p>
                <span className="font-semibold">Dirección</span> {store.address}
              </p>
            )}
            <p>
              <span className="font-semibold">Teléfono</span> {phone}
            </p>
          </div>
        </div>

        {/* Espacio reservado para futuras acciones (suscripciones, seguir, etc.) */}
      </div>
    </div>
  );
}

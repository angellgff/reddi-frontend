export default function OrderTrackingSkeleton() {
  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* SECCIÓN 1: DATOS DEL CLIENTE SKELETON */}
      <div className="flex justify-between items-start">
        <div>
          {/* Título: "Datos del cliente" */}
          <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-8 mt-4 text-sm">
            {/* Columna "Nombre completo" */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            {/* Columna "Método de pago" */}
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Botón "Contactar cliente" */}
        <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* SECCIÓN 2: MAPA DE SEGUIMIENTO SKELETON */}
      <div className="relative w-full grow rounded-2xl bg-gray-200"></div>

      {/* SECCIÓN 3: DATOS DEL REPARTIDOR SKELETON */}
      <div className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-2xl">
        <div className="flex items-center gap-3">
          {/* Avatar del repartidor */}
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          {/* Nombre y rol del repartidor */}
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        {/* Botón de llamada */}
        <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

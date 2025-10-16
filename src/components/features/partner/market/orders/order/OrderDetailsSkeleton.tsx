export default function OrderDetailsSkeleton() {
  return (
    // El contenedor principal mantiene el espaciado vertical `space-y-6`
    <div className="space-y-6 animate-pulse">
      {/* Placeholder para "Detalles del pedido" */}
      <div className="h-7 w-48 bg-gray-200 rounded-lg"></div>

      {/* SECCIÓN 1: INFORMACIÓN DE LA TIENDA SKELETON */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* SECCIÓN 2: LISTA DE PRODUCTOS SKELETON */}
      {/* Se renderizan dos items de ejemplo para mostrar que es una lista */}
      <div className="my-6 space-y-4">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded-lg"></div>
            </div>
            <hr className="border-gray-200" />
          </div>
        ))}
      </div>

      {/* Separador */}
      <hr className="border-gray-200" />

      {/* SECCIÓN 3: DESGLOSE DE COSTOS SKELETON */}
      <div className="my-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Separador */}
      <hr className="border-gray-200" />

      {/* Total Skeleton */}
      <div className="flex justify-between items-center my-4">
        <div className="h-7 w-16 bg-gray-200 rounded-lg"></div>
        <div className="h-7 w-28 bg-gray-200 rounded-lg"></div>
      </div>

      {/* SECCIÓN 4: DIRECCIÓN DE ENTREGA SKELETON */}
      <div className="bg-gray-200 p-4 rounded-2xl flex items-center gap-4">
        <div className="bg-gray-300 h-14 w-14 rounded-lg flex-shrink-0"></div>
        <div className="w-full space-y-2">
          <div className="h-5 w-3/4 bg-gray-300 rounded-lg"></div>
          <div className="h-4 w-full bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

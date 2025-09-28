// src/components/ui/StatCard.tsx
import React from "react";

export default function StatCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    // Contenedor principal de la tarjeta
    <div
      className="bg-white rounded-2xl p-4 flex items-center space-x-4
                    justify-center md:justify-start w-full"
    >
      {/* Círculo del Ícono */}
      <div className="rounded-full bg-primary h-14 w-14 flex items-center justify-center">
        {children}
      </div>

      {/* Contenido de Texto */}
      <div>
        <p className="text-xs font-medium text-gray-500 font-roboto">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

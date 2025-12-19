"use client";

import React, { useState } from "react";
import EyeLoginIcon from "@/src/components/icons/EyeLoginIcon";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import Link from "next/link";
import { deleteDriver } from "@/src/lib/admin/data/drivers/deleteDriver";
import { useRouter } from "next/navigation";

export type Driver = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  documentsStatus: "Pendientes" | "Activo" | "Cancelado" | "Shipping";
  verificationStatus: "Pendientes" | "Activo" | "Cancelado" | "Shipping";
  ordersCount: number;
};

function StatusChip({ label }: { label: Driver["documentsStatus"] }) {
  const styles: Record<string, string> = {
    Pendientes: "bg-[#FFF5C5] text-[#E27D00]",
    Activo: "bg-[#D7FFD8] text-[#04910C]",
    Cancelado: "bg-[#FFDCDC] text-[#FF0000]",
    Shipping: "bg-[#DCD2FF] text-[#7F27FF]",
  };
  const cls = styles[label] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function DriverListItem({ driver }: { driver: Driver }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este repartidor?")) {
      setIsDeleting(true);
      const result = await deleteDriver(driver.id);
      setIsDeleting(false);
      if (result.success) {
        // Optional: Show toast
      } else {
        alert("Error al eliminar repartidor: " + result.error);
      }
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 font-roboto">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        #{driver.id.slice(0, 6)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {driver.fullName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {driver.email ?? "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {driver.phone ?? "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <StatusChip label={driver.documentsStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <StatusChip label={driver.verificationStatus} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {driver.ordersCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-4 text-gray-500">
          <Link href={`/admin/drivers/profile/${driver.id}`}>
            <button type="button" aria-label="Ver">
              <EyeLoginIcon fill="#6A6C71" />
            </button>
          </Link>
          <Link href={`/admin/drivers/profile/${driver.id}`}>
          <button type="button" aria-label="Editar">
            <EditPartnerIcon fill="#6A6C71" />
          </button>
          </Link>
          <button 
            type="button" 
            aria-label="Eliminar"
            onClick={handleDelete}
            disabled={isDeleting}
            className={isDeleting ? "opacity-50 cursor-not-allowed" : ""}
          >
            <DeletePartnerIcon fill="#6A6C71" />
          </button>
        </div>
      </td>
    </tr>
  );
}

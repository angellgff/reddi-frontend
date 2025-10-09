import React from "react";
import Link from "next/link";
import Image from "next/image";
import EyeLoginIcon from "@/src/components/icons/EyeLoginIcon";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import { Restaurant } from "@/src/lib/admin/type";
import { partnersCategories } from "@/src/lib/type";

// Componente para el tag de estado
const StatusBadge = ({ state }: { state: Restaurant["state"] }) => {
  const isActive = state === "open";

  return (
    <span
      className={`py-1 px-2 text-xs font-medium rounded-lg ${
        isActive ? "bg-green-100 text-[#04910C]" : "bg-red-100 text-[#FF0000]"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
};

interface UserListItemProps {
  restaurant: Restaurant;
}

export default function UserListItem({ restaurant }: UserListItemProps) {
  const category = partnersCategories.find((cat) => cat.value === restaurant.type)?.label;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 font-roboto">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        #{restaurant.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center">
          {/* Al implementar poner el border-4*/}
          <div className="flex-shrink-0 h-8 w-8 relative border-primary rounded-full">
            {/* Placeholder para la imagen */}
            <Image
              className="h-8 w-8 rounded-full"
              src={restaurant.imageUrl}
              fill={true}
              alt={`${restaurant.name} logo`}
            />
          </div>
          <div className="ml-4">{restaurant.name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {restaurant.nit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {restaurant.address}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {restaurant.totalOrders}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <StatusBadge state={restaurant.state} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-4 text-gray-500">
          <Link href={`/admin/aliados/ver/${restaurant.id}`}>
            <button
              type="button"
              id={`view-${restaurant.id}`}
              aria-label="Visualizar"
            >
              <EyeLoginIcon fill="#6A6C71" />
            </button>
          </Link>
          <Link href={`/admin/aliados/editar/${restaurant.id}`}>
            <button
              type="button"
              id={`edit-${restaurant.id}`}
              aria-label="Editar"
            >
              <EditPartnerIcon fill="#6A6C71" />
            </button>
          </Link>

          <button
            type="button"
            id={`del-${restaurant.id}`}
            aria-label="Eliminar"
          >
            <DeletePartnerIcon fill="#6A6C71" />
          </button>
        </div>
      </td>
    </tr>
  );
}

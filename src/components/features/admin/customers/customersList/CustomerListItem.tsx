import React from "react";
import EyeLoginIcon from "@/src/components/icons/EyeLoginIcon";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import Link from "next/link";

export type Customer = {
  id: string;
  fullName: string;
  phone: string | null;
  created_at: string | null;
  total_amount: number;
};

export default function CustomerListItem({ customer }: { customer: Customer }) {
  const currency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(customer.total_amount || 0);

  const created = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString("es-CO")
    : "-";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 font-roboto">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        #{customer.id.slice(0, 6)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {customer.fullName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">-</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {customer.phone ?? "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {created}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {currency}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-4 text-gray-500">
          <Link href={`/admin/customers/${customer.id}`}>
            <button type="button" aria-label="Ver">
              <EyeLoginIcon fill="#6A6C71" />
            </button>
          </Link>
          <button type="button" aria-label="Editar">
            <EditPartnerIcon fill="#6A6C71" />
          </button>
          <button type="button" aria-label="Eliminar">
            <DeletePartnerIcon fill="#6A6C71" />
          </button>
        </div>
      </td>
    </tr>
  );
}

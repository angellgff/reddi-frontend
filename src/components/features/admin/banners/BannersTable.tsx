"use client";

import React from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

// Data type
export type Banner = {
  id: string;
  image: string;
  title: string;
  category: string;
  clicks: number;
  dateRange: string;
  status: "active" | "inactive";
};

interface BannersTableProps {
  banners: Banner[];
}

export default function BannersTable({ banners }: BannersTableProps) {
  return (
    <div className="overflow-x-auto border border-[#D9DCE3] rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#E7E7E7]">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Banner
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Título
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Categoría
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Clics
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Fecha
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Estado
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-[#525252] uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {banners.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No se encontraron banners.
              </td>
            </tr>
          ) : (
            banners.map((banner, index) => (
              <tr key={`${banner.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="w-20 h-12 bg-gray-200 rounded-md overflow-hidden relative">
                    {/* Using a colored div as placeholder if image fails, or Next Image */}
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-300 flex items-center justify-center text-xs text-gray-500">
                        Img
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {banner.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {banner.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {banner.clicks}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {banner.dateRange}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={
                      banner.status === "active"
                        ? "bg-[#D7FFD8] text-[#04910C] border-none hover:bg-[#D7FFD8]"
                        : "bg-gray-100 text-gray-800 border-none"
                    }
                  >
                    {banner.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Eye className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/admin/banners/edit/${banner.id}`}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

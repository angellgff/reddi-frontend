"use client";

import {
  removePlacement,
  updatePlacementOrder,
} from "@/src/lib/admin/actions/placements";
import { Button } from "@/src/components/ui/button";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function PlacementList({
  placements,
  sectionKey,
}: {
  placements: any[];
  sectionKey: string;
}) {
  const [loading, setLoading] = useState(false);

  if (placements.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        No partners in this section.
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      setLoading(true);
      try {
        await removePlacement(id);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === placements.length - 1) return;

    setLoading(true);
    try {
      const newPlacements = [...placements];
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      // Swap array elements
      const itemToMove = newPlacements[index];
      newPlacements.splice(index, 1);
      newPlacements.splice(swapIndex, 0, itemToMove);

      // Generate updates with sequential display_order
      const updates = newPlacements.map((p, i) => ({
        id: p.id,
        display_order: i + 1,
      }));

      await updatePlacementOrder(updates);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`space-y-2 ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {placements.map((placement, index) => (
        <div
          key={placement.id}
          className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-mono w-6 text-center">
              {index + 1}
            </span>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-white">
              {placement.partner?.image_url ? (
                <Image
                  src={placement.partner.image_url}
                  alt={placement.partner.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                  NA
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">
                {placement.partner?.name || "Unknown Partner"}
              </p>
              <p className="text-xs text-gray-500">
                {placement.partner?.partner_type}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => handleMove(index, "up")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={index === placements.length - 1}
              onClick={() => handleMove(index, "down")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(placement.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

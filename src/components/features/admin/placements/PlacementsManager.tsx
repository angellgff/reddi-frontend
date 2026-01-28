"use client";

import { useState } from "react";
import { Constants } from "@/src/lib/database.types";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { PlacementList } from "./PlacementList";
import { AddPlacementModal } from "./AddPlacementModal";
import { Database } from "@/src/lib/database.types";

type AppSectionKey = Database["public"]["Enums"]["app_section_key"];

export function PlacementsManager({
  initialPlacements,
}: {
  initialPlacements: any[];
}) {
  const sectionKeys = Constants.public.Enums.app_section_key;
  const [activeTab, setActiveTab] = useState<AppSectionKey>(sectionKeys[0]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap bg-gray-100 p-1 rounded-md">
          {sectionKeys.map((key) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "ghost"}
              onClick={() => setActiveTab(key)}
              size="sm"
              className={
                activeTab === key
                  ? "bg-white text-black shadow-sm"
                  : "hover:bg-gray-200 text-gray-600"
              }
            >
              {formatSectionName(key)}
            </Button>
          ))}
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Partner
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          {formatSectionName(activeTab)}
        </h3>
        <PlacementList
          placements={initialPlacements.filter(
            (p) => p.section_key === activeTab,
          )}
          sectionKey={activeTab}
        />
      </div>

      <AddPlacementModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        sectionKey={activeTab}
      />
    </div>
  );
}

function formatSectionName(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

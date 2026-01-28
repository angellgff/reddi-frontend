"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { addPlacement } from "@/src/lib/admin/actions/placements";
import { searchPartners } from "@/src/lib/admin/data/placements/getAvailablePartners";
import { Database } from "@/src/lib/database.types";
import { Loader2 } from "lucide-react";

type AppSectionKey = Database["public"]["Enums"]["app_section_key"];

export function AddPlacementModal({
  open,
  onOpenChange,
  sectionKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionKey: AppSectionKey;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
      setSelectedPartner(null);
      setLoading(false);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      return;
    }

    // Initial load
    setLoading(true);
    searchPartners("").then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, [open]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setSelectedPartner(null);
    setLoading(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await searchPartners(val);
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (partner: any) => {
    setSelectedPartner(partner);
    setSearch(partner.name);
    setResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedPartner) return;
    setSubmitting(true);
    try {
      await addPlacement(selectedPartner.id, sectionKey);
      onOpenChange(false);
    } catch (e: any) {
      alert(e.message || "Error adding placement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar a {sectionKey?.replace(/_/g, " ")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 min-h-[300px]">
          <div className="relative">
            <Input
              placeholder="Buscar partner por nombre..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={submitting}
            />
            {loading && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
              </div>
            )}

            {!selectedPartner && (
              <div className="border rounded-md mt-2 max-h-60 overflow-y-auto shadow-sm bg-white">
                {results.length === 0 && !loading && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )}
                {results.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                    onClick={() => handleSelect(p)}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 uppercase">
                      {p.partner_type}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedPartner && (
              <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-700 font-semibold mb-1">
                    SELECTED
                  </div>
                  <div className="font-bold text-green-900">
                    {selectedPartner.name}
                  </div>
                  <div className="text-xs text-green-700">
                    {selectedPartner.partner_type}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPartner(null);
                    setSearch("");
                    handleSearch("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPartner || submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : null}
            {submitting ? "Guardando..." : "Agregar Partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { SearchResultPartner } from "@/src/lib/finalUser/search/searchPartners";
import PartnerAccordionItem from "./PartnerAccordionItem";

export default function PartnerAccordionList({
  partners,
}: {
  partners: SearchResultPartner[];
}) {
  // By default expand the first one
  const [expandedId, setExpandedId] = useState<string | null>(partners[0]?.id || null);

  const toggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col pb-20">
      {partners.map((p) => (
        <PartnerAccordionItem
          key={p.id}
          partner={p}
          isOpen={expandedId === p.id}
          onToggle={() => toggle(p.id)}
        />
      ))}
    </div>
  );
}

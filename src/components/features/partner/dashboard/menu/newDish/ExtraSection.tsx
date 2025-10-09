// src/components/preview/ExtraSection.tsx

import MinusIcon from "@/src/components/icons/MinusIcon";
import ExtraItem from "./ExtraItem";
import {
  ProductSectionForm,
  ProductExtra,
} from "@/src/lib/partner/productTypes";

interface ExtraSectionProps {
  section: ProductSectionForm;
  extrasCatalog: ProductExtra[];
}

export default function ExtraSection({
  section,
  extrasCatalog,
}: ExtraSectionProps) {
  return (
    <div className="mt-4">
      {/* Encabezado de la Sección */}
      <div className="flex items-center justify-between p-3 bg-[#EFF2F5] rounded-lg">
        <h3 className="font-bold text-gray-800">{section.name}</h3>
        <div className="flex items-center gap-2">
          {section.isRequired && (
            <span className="text-xs text-primary font-roboto">Requerido</span>
          )}
          <button className="bg-[#9BA1AE] rounded-full">
            <MinusIcon />
          </button>
        </div>
      </div>

      {/* Lista de Items */}
      <div className="pl-4 pr-2 divide-y divide-gray-200">
        {section.options.map((opt) => {
          const extra = opt.extraId
            ? extrasCatalog.find((e) => e.id === opt.extraId)
            : null;
          const priceText = opt.overridePrice
            ? `+$${opt.overridePrice}`
            : extra
            ? `+$${extra.defaultPrice}`
            : undefined;
          return (
            <ExtraItem
              key={opt.clientId}
              item={{
                name: extra?.name || "(sin seleccionar)",
                imageUrl: extra?.imageUrl || null,
                priceText,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

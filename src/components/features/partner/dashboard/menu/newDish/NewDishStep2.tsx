"use client";
import {
  ProductSectionForm,
  SectionExtraSelection,
  ProductExtra,
} from "@/src/lib/partner/productTypes";
import { useState } from "react";
import BasicInput from "@/src/components/basics/BasicInput";
import Checkbox from "@/src/components/basics/CheckBox";
import FooterButtons from "@/src/components/basics/FooterButtons";
import SelectInput from "@/src/components/basics/SelectInput";

interface NewDishStep2Props {
  sections: ProductSectionForm[];
  onSectionsChange: (newSections: ProductSectionForm[]) => void;
  onNextStep: () => void;
  onGoBack: () => void;
  onPreview: () => void;
  extrasCatalog: ProductExtra[];
  errors: Record<string, string>;
  onRequestCreateExtra: (sectionId: string, optionId: string) => void;
}

export default function NewDishStep2({
  sections,
  onSectionsChange,
  onNextStep,
  onGoBack,
  onPreview,
  extrasCatalog,
  errors,
  onRequestCreateExtra,
}: NewDishStep2Props) {
  const addSection = () => {
    const newSection: ProductSectionForm = {
      clientId: crypto.randomUUID(),
      name: "",
      isRequired: false,
      options: [],
    };
    onSectionsChange([...sections, newSection]);
  };
  const removeSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.clientId !== id));
  };
  const handleSectionChange = (
    id: string,
    field: keyof Omit<ProductSectionForm, "clientId" | "options">,
    value: string | boolean
  ) => {
    onSectionsChange(
      sections.map((s) => (s.clientId === id ? { ...s, [field]: value } : s))
    );
  };
  const addOption = (sectionId: string) => {
    const newOpt: SectionExtraSelection = {
      clientId: crypto.randomUUID(),
      extraId: null,
      overridePrice: "",
    };
    onSectionsChange(
      sections.map((s) =>
        s.clientId === sectionId ? { ...s, options: [...s.options, newOpt] } : s
      )
    );
  };
  const removeOption = (sectionId: string, optId: string) => {
    onSectionsChange(
      sections.map((s) =>
        s.clientId === sectionId
          ? { ...s, options: s.options.filter((o) => o.clientId !== optId) }
          : s
      )
    );
  };
  const updateOption = (
    sectionId: string,
    optId: string,
    field: keyof Omit<SectionExtraSelection, "clientId">,
    value: string | null
  ) => {
    onSectionsChange(
      sections.map((s) => {
        if (s.clientId !== sectionId) return s;
        return {
          ...s,
          options: s.options.map((o) =>
            o.clientId === optId ? { ...o, [field]: value as any } : o
          ),
        };
      })
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg text-gray-900 font-inter">
          Grupos de opciones y extras
        </h2>
        <button
          type="button"
          onClick={addSection}
          className="px-12 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-green-700 focus:outline-none flex items-center"
        >
          Añadir sección
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNextStep();
        }}
        className="space-y-8"
      >
        <div className="space-y-6">
          {sections.length === 0 ? (
            <span className="text-gray-500 m-6">
              No hay secciones. Añada una con el botón de la esquina.
            </span>
          ) : (
            sections.map((section) => {
              const usedExtraIds = new Set(
                section.options.filter((o) => o.extraId).map((o) => o.extraId)
              );
              return (
                <div
                  key={section.clientId}
                  className="border border-[#D9DCE3] rounded-xl p-4 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-full">
                      <BasicInput
                        id={`sec-name-${section.clientId}`}
                        label="Nombre de la sección"
                        placeholder="Ejm. Salsas, Acompañantes"
                        value={section.name}
                        onChange={(e) =>
                          handleSectionChange(
                            section.clientId,
                            "name",
                            e.target.value
                          )
                        }
                        required
                        error={errors[`section-${section.clientId}-name`] || ""}
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-0 sm:pt-6 flex-shrink-0">
                      <Checkbox
                        label="Requerido"
                        id={`required-${section.clientId}`}
                        checked={section.isRequired}
                        onChange={(e) =>
                          handleSectionChange(
                            section.clientId,
                            "isRequired",
                            e.target.checked
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeSection(section.clientId)}
                        className="px-6 py-2 text-white bg-[#DB5151] rounded-xl hover:bg-red-700 flex items-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 sm:pl-4">
                    {section.options.map((opt) => (
                      <div
                        key={opt.clientId}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
                      >
                        <div className="grow">
                          <SelectInput
                            id={`opt-extra-${opt.clientId}`}
                            name={`opt-extra-${opt.clientId}`}
                            label="Extra"
                            placeholder="Seleccione extra"
                            value={opt.extraId || ""}
                            options={[
                              {
                                value: "__create__",
                                label: "➕ Crear nuevo extra",
                              },
                              ...extrasCatalog.map((ex) => ({
                                value: ex.id,
                                label: `${ex.name} (def: $${ex.defaultPrice})`,
                                disabled:
                                  usedExtraIds.has(ex.id) &&
                                  ex.id !== opt.extraId,
                              })),
                            ]}
                            onChange={(e) => {
                              if (e.target.value === "__create__") {
                                onRequestCreateExtra(
                                  section.clientId,
                                  opt.clientId
                                );
                                return;
                              }
                              updateOption(
                                section.clientId,
                                opt.clientId,
                                "extraId",
                                e.target.value
                              );
                            }}
                            getOptionValue={(o) => (o as any).value}
                            getOptionLabel={(o) => (o as any).label}
                            error={errors[`option-${opt.clientId}-extra`]}
                            required
                          />
                        </div>
                        <BasicInput
                          id={`opt-override-${opt.clientId}`}
                          label="Precio override (opcional)"
                          placeholder="Usar precio por defecto"
                          value={opt.overridePrice}
                          onChange={(e) =>
                            updateOption(
                              section.clientId,
                              opt.clientId,
                              "overridePrice",
                              e.target.value
                            )
                          }
                          error={
                            errors[`option-${opt.clientId}-overridePrice`] || ""
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeOption(section.clientId, opt.clientId)
                          }
                          className="px-4 py-2 text-sm text-white bg-[#DB5151] rounded-lg"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addOption(section.clientId)}
                    className="flex items-center text-sm font-medium hover:underline"
                  >
                    Añadir opción
                  </button>
                </div>
              );
            })
          )}
        </div>
        <FooterButtons
          onGoBack={onGoBack}
          onPreview={onPreview}
          onSaveAndExit={() => {}}
          onSubmit={() => {}}
        />
      </form>
    </>
  );
}

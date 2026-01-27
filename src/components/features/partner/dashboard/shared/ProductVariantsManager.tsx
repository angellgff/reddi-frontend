"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicInput from "@/src/components/basics/BasicInput";
import BasicButton from "@/src/components/basics/BasicButton";
import CheckBox from "@/src/components/basics/CheckBox";
import BasicModal from "@/src/components/basics/BasicModal";
import {
  createVariantGroup,
  updateVariantGroup,
  deleteVariantGroup,
  createVariant,
  updateVariant,
  deleteVariant,
} from "./variantActions";

type Variant = {
  id: string;
  name: string;
  base_price: number;
  is_available: boolean | null;
  group_id: string | null;
};

type VariantGroup = {
  id: string;
  name: string;
  is_required?: boolean;
  product_variants: Variant[];
};

interface MarketProductVariantsProps {
  productId: string;
  groups: VariantGroup[];
  revalidateUrl?: string; // Optional custom path to revalidate
}

export default function ProductVariantsManager({
  productId,
  groups,
  revalidateUrl,
}: MarketProductVariantsProps) {
  const router = useRouter();

  // If no URL provided, default to market path (legacy support)
  const path = revalidateUrl || `/partner/market/productos/editar/${productId}`;

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group Edit State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupData, setEditingGroupData] = useState({
    name: "",
    is_required: false,
  });

  // Variant Edit State
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariantData, setEditingVariantData] = useState({
    name: "",
    base_price: "",
    is_available: true,
  });

  // State for adding new variant form per group
  const [addingVariantToGroupId, setAddingVariantToGroupId] = useState<
    string | null
  >(null);
  const [newVariantData, setNewVariantData] = useState({
    name: "",
    base_price: "",
    is_available: true,
  });

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setLoading(true);
      await createVariantGroup(productId, newGroupName, newGroupRequired, path);
      setNewGroupName("");
      setNewGroupRequired(false);
      setIsAddingGroup(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al crear grupo");
    } finally {
      setLoading(false);
    }
  };

  const startEditingGroup = (group: VariantGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupData({
      name: group.name,
      is_required: group.is_required || false,
    });
  };

  const handleUpdateGroup = async () => {
    if (!editingGroupId || !editingGroupData.name.trim()) return;
    try {
      setLoading(true);
      await updateVariantGroup(
        productId,
        editingGroupId,
        editingGroupData,
        path,
      );
      setEditingGroupId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("¿Eliminar grupo y sus variantes?")) return;
    try {
      setLoading(true);
      await deleteVariantGroup(groupId, productId, path);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar grupo");
    } finally {
      setLoading(false);
    }
  };

  const startAddingVariant = (groupId: string) => {
    setAddingVariantToGroupId(groupId);
    setNewVariantData({ name: "", base_price: "0", is_available: true });
  };

  const handleCreateVariant = async (groupId: string) => {
    if (!newVariantData.name.trim()) return;
    try {
      setLoading(true);
      await createVariant(
        productId,
        groupId,
        {
          name: newVariantData.name,
          base_price: parseFloat(newVariantData.base_price) || 0,
          is_available: newVariantData.is_available,
        },
        path,
      );
      setAddingVariantToGroupId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al crear variante");
    } finally {
      setLoading(false);
    }
  };

  const startEditingVariant = (variant: Variant) => {
    setEditingVariantId(variant.id);
    setEditingVariantData({
      name: variant.name,
      base_price: String(variant.base_price),
      is_available: variant.is_available ?? true,
    });
  };

  const handleUpdateVariant = async () => {
    if (!editingVariantId || !editingVariantData.name.trim()) return;
    try {
      setLoading(true);
      await updateVariant(
        productId,
        editingVariantId,
        {
          name: editingVariantData.name,
          base_price: parseFloat(editingVariantData.base_price) || 0,
          is_available: editingVariantData.is_available,
        },
        path,
      );
      setEditingVariantId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar variante");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("¿Eliminar variante?")) return;
    try {
      setLoading(true);
      await deleteVariant(variantId, productId, path);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar variante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Variantes</h2>
        <BasicButton
          className="bg-primary text-white border-none px-4 py-2 hover:opacity-90 text-sm font-medium"
          onClick={() => setIsAddingGroup(true)}
          disabled={loading}
        >
          + Agregar Grupo
        </BasicButton>
      </div>

      <BasicModal
        open={isAddingGroup}
        onClose={() => setIsAddingGroup(false)}
        title="Agregar Grupo de Variantes"
      >
        <div className="flex flex-col gap-6">
          <BasicInput
            id="newGroupName"
            label="Nombre del Grupo"
            placeholder="Ej: Tamaño, Color, Salsas"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newGroupRequired}
                onChange={(e) => setNewGroupRequired(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                ¿Es obligatorio para el usuario?
              </span>
            </label>
            <p className="text-xs text-gray-400 ml-2">
              (El usuario deberá seleccionar al menos una opción)
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <BasicButton
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-4 py-2 text-sm"
              onClick={() => setIsAddingGroup(false)}
            >
              Cancelar
            </BasicButton>
            <BasicButton
              className="bg-primary text-white hover:opacity-90 px-4 py-2 border-none text-sm"
              onClick={handleCreateGroup}
              disabled={loading || !newGroupName.trim()}
            >
              {loading ? "Guardando..." : "Guardar Grupo"}
            </BasicButton>
          </div>
        </div>
      </BasicModal>

      {/* Edit Group Modal */}
      <BasicModal
        open={!!editingGroupId}
        onClose={() => setEditingGroupId(null)}
        title="Editar Grupo de Variantes"
      >
        <div className="flex flex-col gap-6">
          <BasicInput
            id="editGroupName"
            label="Nombre del Grupo"
            placeholder="Ej: Tamaño, Color, Salsas"
            value={editingGroupData.name}
            onChange={(e) =>
              setEditingGroupData({ ...editingGroupData, name: e.target.value })
            }
          />
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editingGroupData.is_required}
                onChange={(e) =>
                  setEditingGroupData({
                    ...editingGroupData,
                    is_required: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                ¿Es obligatorio para el usuario?
              </span>
            </label>
            <p className="text-xs text-gray-400 ml-2">
              (El usuario deberá seleccionar al menos una opción)
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <BasicButton
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-4 py-2 text-sm"
              onClick={() => setEditingGroupId(null)}
            >
              Cancelar
            </BasicButton>
            <BasicButton
              className="bg-primary text-white hover:opacity-90 px-4 py-2 border-none text-sm"
              onClick={handleUpdateGroup}
              disabled={loading || !editingGroupData.name.trim()}
            >
              {loading ? "Guardando..." : "Actualizar Grupo"}
            </BasicButton>
          </div>
        </div>
      </BasicModal>

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-textPrimary">{group.name}</h3>
                {group.is_required && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    Requerido
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEditingGroup(group)}
                  disabled={loading}
                  className="text-primary hover:text-primary/80 text-sm font-medium underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm underline"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="p-4 bg-white">
              {group.product_variants && group.product_variants.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 border-b pb-2">
                    <div className="col-span-5">Nombre</div>
                    <div className="col-span-3">Precio</div>
                    <div className="col-span-2 text-center">Disponible</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>
                  {group.product_variants.map((variant) =>
                    editingVariantId === variant.id ? (
                      <div
                        key={variant.id}
                        className="grid grid-cols-12 gap-4 items-center text-sm bg-blue-50/50 p-2 -mx-2 rounded"
                      >
                        <div className="col-span-5">
                          <BasicInput
                            id={`edit-vName-${variant.id}`}
                            label=""
                            value={editingVariantData.name}
                            onChange={(e) =>
                              setEditingVariantData({
                                ...editingVariantData,
                                name: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <BasicInput
                            id={`edit-vPrice-${variant.id}`}
                            label=""
                            type="number"
                            value={editingVariantData.base_price}
                            onChange={(e) =>
                              setEditingVariantData({
                                ...editingVariantData,
                                base_price: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <input
                            type="checkbox"
                            checked={editingVariantData.is_available}
                            onChange={(e) =>
                              setEditingVariantData({
                                ...editingVariantData,
                                is_available: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="col-span-2 text-right flex justify-end gap-2">
                          <button
                            onClick={() => setEditingVariantId(null)}
                            className="text-gray-500 hover:text-gray-700 text-xs underline"
                          >
                            X
                          </button>
                          <button
                            onClick={handleUpdateVariant}
                            disabled={
                              loading || !editingVariantData.name.trim()
                            }
                            className="text-primary hover:text-primary/80 text-xs font-semibold underline"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={variant.id}
                        className="grid grid-cols-12 gap-4 items-center text-sm p-2 -mx-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="col-span-5 truncate text-textPrimary font-medium">
                          {variant.name}
                        </div>
                        <div className="col-span-3 text-textSecondary">
                          +${variant.base_price}
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              variant.is_available
                                ? "bg-green-500"
                                : "bg-red-300"
                            }`}
                          />
                        </div>
                        <div className="col-span-2 text-right flex justify-end gap-3">
                          <button
                            onClick={() => startEditingVariant(variant)}
                            className="text-primary hover:text-primary/80 text-xs underline"
                            disabled={loading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-500 hover:text-red-700 text-xs underline"
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">
                  No hay variantes en este grupo.
                </p>
              )}

              {/* Add Variant Form */}
              {addingVariantToGroupId === group.id ? (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-4 px-4 pb-4">
                  <h4 className="text-sm font-medium mb-3">Nueva Variante</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <BasicInput
                      id="vName"
                      label="Nombre"
                      value={newVariantData.name}
                      placeholder="Ej: Grande"
                      onChange={(e) =>
                        setNewVariantData({
                          ...newVariantData,
                          name: e.target.value,
                        })
                      }
                    />
                    <BasicInput
                      id="vPrice"
                      label="Precio"
                      type="number"
                      value={newVariantData.base_price}
                      onChange={(e) =>
                        setNewVariantData({
                          ...newVariantData,
                          base_price: e.target.value,
                        })
                      }
                    />
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newVariantData.is_available}
                          onChange={(e) =>
                            setNewVariantData({
                              ...newVariantData,
                              is_available: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          Disponible
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <BasicButton
                      className="bg-white border border-gray-300 text-gray-600 px-3 py-1 text-xs"
                      onClick={() => setAddingVariantToGroupId(null)}
                    >
                      Cancelar
                    </BasicButton>
                    <BasicButton
                      className="bg-primary text-white border-none px-3 py-1 text-xs"
                      onClick={() => handleCreateVariant(group.id)}
                      disabled={loading}
                    >
                      Guardar
                    </BasicButton>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <BasicButton
                    className="bg-gray-100 text-textPrimary hover:bg-gray-200 border-none px-3 py-1.5 text-xs font-medium"
                    onClick={() => startAddingVariant(group.id)}
                    disabled={loading}
                  >
                    + Agregar Variante
                  </BasicButton>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

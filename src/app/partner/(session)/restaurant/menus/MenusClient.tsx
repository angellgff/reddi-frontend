"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createMenuAction,
  deleteMenuAction,
  PartnerMenusData,
  reorderMenusAction,
  reorderMenuSubCategoriesAction,
  updateMenuAction,
} from "./actions";
import { useRouter } from "next/navigation";

const DAY_OPTIONS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
];

type MenuDraft = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  subCategoryIds: string[];
};

function move<T>(items: T[], from: number, to: number) {
  const clone = [...items];
  const [item] = clone.splice(from, 1);
  clone.splice(to, 0, item);
  return clone;
}

function toMenuDraft(
  menu: PartnerMenusData["menus"][number] | null,
): MenuDraft | null {
  if (!menu) return null;

  return {
    id: menu.id,
    name: menu.name,
    startTime: menu.startTime,
    endTime: menu.endTime,
    daysOfWeek: menu.daysOfWeek,
    isActive: menu.isActive,
    subCategoryIds: menu.subCategoryIds,
  };
}

export default function MenusClient({
  initialData,
}: {
  initialData: PartnerMenusData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menus, setMenus] = useState(initialData.menus);
  const [selectedId, setSelectedId] = useState(initialData.menus[0]?.id || "");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedId) || null,
    [menus, selectedId],
  );
  const [localDraft, setLocalDraft] = useState<MenuDraft | null>(
    toMenuDraft(selectedMenu),
  );

  useEffect(() => {
    setMenus(initialData.menus);
    setSelectedId((currentSelectedId) => {
      if (initialData.menus.length === 0) return "";

      const exists = initialData.menus.some(
        (menu) => menu.id === currentSelectedId,
      );

      return exists ? currentSelectedId : initialData.menus[0].id;
    });
  }, [initialData.menus]);

  useEffect(() => {
    setLocalDraft(toMenuDraft(selectedMenu));
  }, [selectedMenu]);

  const availableSubCategories = initialData.subCategories;

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function handleSelectMenu(menuId: string) {
    resetMessages();
    setSelectedId(menuId);
  }

  function handleCreateMenu() {
    resetMessages();
    setCreateName("Nuevo menu");
    setCreateError("");
    setIsCreateModalOpen(true);
  }

  function handleCloseCreateModal() {
    if (isPending) return;
    setIsCreateModalOpen(false);
    setCreateName("");
    setCreateError("");
  }

  function handleConfirmCreateMenu() {
    const name = createName.trim();
    if (!name) {
      setCreateError("El nombre del menu es obligatorio");
      return;
    }
    if (name.length > 100) {
      setCreateError("El nombre no puede superar 100 caracteres");
      return;
    }

    resetMessages();
    setCreateError("");

    startTransition(async () => {
      try {
        const response = await createMenuAction({
          name,
          startTime: "00:00:00",
          endTime: "23:59:59",
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          isActive: true,
          subCategoryIds: [],
        });

        setMessage("Menu creado correctamente");
        setIsCreateModalOpen(false);
        setCreateName("");
        router.refresh();
        setSelectedId(response.id);
      } catch (e: unknown) {
        const msg = (e as Error).message || "No se pudo crear el menu";
        setCreateError(msg);
        setError(msg);
      }
    });
  }

  function handleDeleteMenu() {
    if (!selectedMenu) return;
    resetMessages();
    setIsDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    if (isPending) return;
    setIsDeleteModalOpen(false);
  }

  function handleConfirmDeleteMenu() {
    if (!selectedMenu) return;

    resetMessages();

    startTransition(async () => {
      try {
        await deleteMenuAction(selectedMenu.id);
        setMessage("Menu eliminado correctamente");
        setSelectedId("");
        setIsDeleteModalOpen(false);
        router.refresh();
      } catch (e: unknown) {
        setError((e as Error).message || "No se pudo eliminar el menu");
      }
    });
  }

  function handleReorderMenus(index: number, direction: "up" | "down") {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= menus.length) return;

    const reordered = move(menus, index, nextIndex).map((menu, i) => ({
      ...menu,
      displayOrder: i + 1,
    }));

    setMenus(reordered);
    resetMessages();

    startTransition(async () => {
      try {
        await reorderMenusAction(reordered.map((menu) => menu.id));
        setMessage("Orden de menus actualizado");
        router.refresh();
      } catch (e: unknown) {
        setError((e as Error).message || "No se pudo reordenar menus");
      }
    });
  }

  function updateDraft(patch: Partial<MenuDraft>) {
    if (!localDraft) return;
    setLocalDraft({ ...localDraft, ...patch });
  }

  function toggleDay(day: number) {
    if (!localDraft) return;
    const exists = localDraft.daysOfWeek.includes(day);
    const nextDays = exists
      ? localDraft.daysOfWeek.filter((item) => item !== day)
      : [...localDraft.daysOfWeek, day].sort((a, b) => a - b);

    updateDraft({ daysOfWeek: nextDays });
  }

  function toggleSubCategory(id: string) {
    if (!localDraft) return;
    const exists = localDraft.subCategoryIds.includes(id);
    const next = exists
      ? localDraft.subCategoryIds.filter((item) => item !== id)
      : [...localDraft.subCategoryIds, id];

    updateDraft({ subCategoryIds: next });
  }

  function moveSubCategory(id: string, direction: "up" | "down") {
    if (!localDraft) return;
    const index = localDraft.subCategoryIds.findIndex((item) => item === id);
    if (index < 0) return;

    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= localDraft.subCategoryIds.length) return;

    updateDraft({
      subCategoryIds: move(localDraft.subCategoryIds, index, nextIndex),
    });
  }

  function handleSaveMenu() {
    if (!localDraft) return;
    resetMessages();

    startTransition(async () => {
      try {
        await updateMenuAction(localDraft.id, {
          name: localDraft.name,
          startTime: localDraft.startTime,
          endTime: localDraft.endTime,
          daysOfWeek: localDraft.daysOfWeek,
          isActive: localDraft.isActive,
          subCategoryIds: localDraft.subCategoryIds,
        });

        await reorderMenuSubCategoriesAction(
          localDraft.id,
          localDraft.subCategoryIds,
        );

        setMessage("Menu actualizado correctamente");
        router.refresh();
      } catch (e: unknown) {
        setError((e as Error).message || "No se pudo guardar el menu");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111827]">Menus</h2>
          <button
            type="button"
            onClick={handleCreateMenu}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
            disabled={isPending}
          >
            Nuevo
          </button>
        </div>

        {menus.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#CBD5E1] p-4 text-sm text-[#6B7280]">
            No tienes menus. Crea tu primer menu.
          </p>
        ) : (
          <div className="space-y-2">
            {menus
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((menu, index) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => handleSelectMenu(menu.id)}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedId === menu.id
                      ? "border-primary bg-[#ECFDF5]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {menu.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        menu.isActive
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {menu.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {menu.startTime.slice(0, 5)} - {menu.endTime.slice(0, 5)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="rounded border border-[#D1D5DB] px-2 py-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderMenus(index, "up");
                      }}
                      disabled={index === 0 || isPending}
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      className="rounded border border-[#D1D5DB] px-2 py-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderMenus(index, "down");
                      }}
                      disabled={index === menus.length - 1 || isPending}
                    >
                      Bajar
                    </button>
                  </div>
                </button>
              ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        {localDraft ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#111827]">
                Configuracion del menu
              </h2>
              <button
                type="button"
                onClick={handleDeleteMenu}
                className="rounded-lg border border-[#FCA5A5] px-3 py-2 text-sm font-semibold text-[#B91C1C]"
                disabled={isPending}
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[#374151]">
                Nombre
                <input
                  type="text"
                  value={localDraft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                />
              </label>

              <label className="flex items-center gap-2 pt-7 text-sm font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={localDraft.isActive}
                  onChange={(e) => updateDraft({ isActive: e.target.checked })}
                />
                Menu activo
              </label>

              <label className="text-sm font-medium text-[#374151]">
                Hora inicio
                <input
                  type="time"
                  value={localDraft.startTime.slice(0, 5)}
                  onChange={(e) =>
                    updateDraft({ startTime: `${e.target.value}:00` })
                  }
                  className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                />
              </label>

              <label className="text-sm font-medium text-[#374151]">
                Hora fin
                <input
                  type="time"
                  value={localDraft.endTime.slice(0, 5)}
                  onChange={(e) =>
                    updateDraft({ endTime: `${e.target.value}:00` })
                  }
                  className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-[#374151]">Dias activos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => {
                  const active = localDraft.daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-full px-3 py-1 text-sm ${
                        active
                          ? "bg-primary text-white"
                          : "border border-[#D1D5DB] bg-white text-[#374151]"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[#374151]">
                Subcategorias del menu
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {availableSubCategories.map((subCategory) => {
                  const selected = localDraft.subCategoryIds.includes(
                    subCategory.id,
                  );
                  const selectedIndex = localDraft.subCategoryIds.findIndex(
                    (id) => id === subCategory.id,
                  );
                  return (
                    <div
                      key={subCategory.id}
                      className="rounded-lg border border-[#E5E7EB] p-3"
                    >
                      <label className="flex items-center gap-2 text-sm text-[#111827]">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSubCategory(subCategory.id)}
                        />
                        {subCategory.name}
                      </label>

                      {selected && (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className="rounded border border-[#D1D5DB] px-2 py-1 text-xs"
                            onClick={() =>
                              moveSubCategory(subCategory.id, "up")
                            }
                            disabled={selectedIndex <= 0}
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            className="rounded border border-[#D1D5DB] px-2 py-1 text-xs"
                            onClick={() =>
                              moveSubCategory(subCategory.id, "down")
                            }
                            disabled={
                              selectedIndex < 0 ||
                              selectedIndex >=
                                localDraft.subCategoryIds.length - 1
                            }
                          >
                            Bajar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveMenu}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">
            Selecciona un menu para editar su configuracion.
          </p>
        )}

        {message && <p className="mt-4 text-sm text-[#166534]">{message}</p>}
        {error && <p className="mt-4 text-sm text-[#B91C1C]">{error}</p>}
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#111827]">Crear menu</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Define el nombre inicial del menu. Luego podras configurar
              horario, dias y subcategorias.
            </p>

            <label className="mt-4 block text-sm font-medium text-[#374151]">
              Nombre del menu
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D1D5DB] px-3 py-2"
                placeholder="Ej. Menu principal"
                autoFocus
              />
            </label>

            {createError && (
              <p className="mt-3 text-sm text-[#B91C1C]">{createError}</p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151]"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateMenu}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                disabled={isPending}
              >
                {isPending ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Eliminar menu
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Vas a eliminar{" "}
              <span className="font-semibold">{selectedMenu.name}</span>. Esta
              accion no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151]"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMenu}
                className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white"
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

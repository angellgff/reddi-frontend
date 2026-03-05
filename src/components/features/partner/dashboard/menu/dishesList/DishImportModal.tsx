"use client";

import React, { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  importDishesFromFileAction,
  getDishesImportTemplateAction,
} from "@/src/lib/partner/bulkUploadActions";

type ImportResult = {
  success: boolean;
  count: number;
  errors: string[];
};

export default function DishImportModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      // @ts-ignore
      const res = await importDishesFromFileAction(null, formData);
      setResult(res);
      if (res.success && res.errors.length === 0) {
        setFile(null);
      }
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await getDishesImportTemplateAction();

      if (res.success && res.base64) {
        const link = document.createElement("a");
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`;
        link.download = "plantilla_platos.xlsx";
        link.click();
      } else {
        console.error("Failed to download template:", res.error);
        alert("Error al descargar la plantilla.");
      }
    } catch (e) {
      console.error(e);
      alert("Error inesperado al descargar la plantilla.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-5 py-2 text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors font-medium text-sm flex items-center gap-2">
          <FileSpreadsheet size={18} />
          Importar Excel/CSV
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Importar Platillos
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-gray-500 mb-4 flex flex-col gap-2">
            <span>
              Carga un archivo Excel (.xlsx/.xls) o CSV (.csv) con tus
              platillos. Las columnas requeridas son:{" "}
              <strong>Name, Price, Category</strong>. Opcional:{" "}
              <strong>Tags</strong>.
            </span>
            <button
              onClick={handleDownloadTemplate}
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1 self-start"
            >
              <Download size={14} /> Descargar Plantilla
            </button>
          </Dialog.Description>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-gray-400" size={32} />
                {file ? (
                  <p className="font-medium text-gray-900">{file.name}</p>
                ) : (
                  <p className="text-gray-500">
                    Arrastra o selecciona un archivo Excel o CSV
                  </p>
                )}
              </div>
            </div>

            {result && (
              <div
                className={cn(
                  "p-4 rounded-lg text-sm",
                  result.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {result.success ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {result.success
                    ? "Importación completada"
                    : "Error en la importación"}
                </div>
                <p>{result.count} platillos procesados correctamente.</p>
                {result.errors.length > 0 && (
                  <ul className="list-disc list-inside mt-2 max-h-32 overflow-y-auto">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleUpload}
                disabled={!file || isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPending ? "Procesando..." : "Subir Archivo"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

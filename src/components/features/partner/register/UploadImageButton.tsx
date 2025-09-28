// FileUploadButton.tsx (REFACTORIZADO)
"use client";

import UploadZoneIcon from "@/src/components/icons/UploadZoneIcon";
import Image from "next/image";
import { ChangeEvent, useRef } from "react";
import { useEffect } from "react";

// --- PROPS MÁS SIMPLES ---
interface FileUploadButtonProps {
  onFileChange: (file: File | null) => void;
  name?: string;
  value?: File | null; // El archivo actual para mostrar la vista previa
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function FileUploadButton({
  onFileChange,
  name = "file",
  value,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value ? URL.createObjectURL(value) : null;

  const handleFileSelected = (selectedFile: File | null) => {
    if (!selectedFile) {
      onFileChange(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      alert(`El tamaño máximo es ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen.");
      return;
    }
    onFileChange(selectedFile);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFileChange(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center transition-colors cursor-pointer"
    >
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />
      {value && previewUrl ? (
        <>
          <div className="relative w-32 h-11">
            <Image
              src={previewUrl}
              alt="Vista previa"
              fill={true}
              className="rounded-md object-fit"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 flex items-center justify-center bg-red-600 text-white rounded-full h-5 w-5 text-xs hover:bg-red-700 z-10"
              aria-label="Eliminar imagen"
            >
              &#x2715;
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 rounded-[30px] bg-[#CDF7E7] flex items-center justify-center mb-3">
            <UploadZoneIcon />
          </div>
          <span className="font-medium text-primary text-sm">
            Subir foto / logo
          </span>
        </>
      )}
    </div>
  );
}

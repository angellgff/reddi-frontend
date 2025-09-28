import Image from "next/image";

import UploadImageIcon from "@/src/components/icons/UploadImageIcon";
import { forwardRef, useState, useEffect, ChangeEvent, DragEvent } from "react";

interface FileUploadZoneProps {
  required?: boolean;
  onFileChange?: (file: File | null) => void;
  label?: string;
  value?: File | string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default forwardRef<HTMLDivElement, FileUploadZoneProps>(
  function FileUploadZone(
    {
      required,
      onFileChange,
      value,
      label = "Foto del producto",
      disabled = false,
    },
    ref
  ) {
    const [file, setFile] = useState<File | string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      setFile(value || null);
    }, [value]);

    // Efecto para crear y limpiar la URL de la vista previa
    useEffect(() => {
      if (!file) {
        setPreview(null);
        return;
      }
      if (typeof file === "string") {
        setPreview(file);
        return;
      }
      // Creamos una URL temporal para el archivo seleccionado
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Función de limpieza: se ejecuta cuando el componente se desmonta o 'file' cambia.
      // Esto es crucial para evitar fugas de memoria.
      return () => URL.revokeObjectURL(objectUrl);
    }, [file]); // Este efecto se vuelve a ejecutar cada vez que el 'file' cambia

    // --- MANEJADORES DE EVENTOS ---

    const handleFileSelected = (selectedFile: File | null) => {
      // 1. Si no hay archivo, limpiamos todo y salimos.
      if (!selectedFile) {
        setFile(null);
        onFileChange?.(null);
        return;
      }

      // 2. VALIDACIÓN DE TAMAÑO (antes de hacer nada más)
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        alert(
          `El archivo es demasiado grande. El tamaño máximo permitido es de ${MAX_FILE_SIZE_MB}MB.`
        );
        setFile(null); // ¡CRÍTICO! Limpiamos el estado interno.
        onFileChange?.(null);
        return;
      }

      // 3. VALIDACIÓN DE TIPO DE ARCHIVO
      if (!selectedFile.type.startsWith("image/")) {
        alert(
          "Por favor, selecciona un archivo de imagen válido (JPG, PNG, etc.)."
        );
        setFile(null); // ¡CRÍTICO! Limpiamos el estado interno.
        onFileChange?.(null);
        return;
      }

      // 4. ÉXITO: Si todas las validaciones pasaron, ahora sí actualizamos el estado.
      setFile(selectedFile);
      onFileChange?.(selectedFile);
    };

    // Se activa cuando el usuario selecciona un archivo a través del diálogo
    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelected(e.target.files?.[0] ?? null);
      // Reseteamos el valor para que el evento 'onChange' se dispare incluso si se vuelve a seleccionar el mismo archivo
      e.target.value = "";
    };

    // Se activa cuando el usuario suelta un archivo sobre la zona
    const onDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelected(e.dataTransfer.files?.[0] ?? null);
    };

    // Se activan mientras se arrastra un archivo sobre la zona
    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    // Para eliminar la imagen seleccionada
    const handleRemoveImage = () => {
      setFile(null);
      onFileChange?.(null);
    };

    // Cambiamos el estilo del borde dinámicamente
    const borderColor = isDragging ? "border-blue-500" : "border-[#D0D5DD]";

    return (
      <>
        <label
          className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
          htmlFor={`${preview ? "" : "file-upload-input"}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        {/* Input de archivo oculto que maneja la selección de archivos */}
        <input
          id="file-upload-input"
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
        />

        {preview && file ? (
          // --- VISTA PREVIA (cuando ya hay un archivo) ---
          <div className="mt-1 relative p-2 border border-gray-300 rounded-md">
            <Image
              src={preview}
              alt={file instanceof File ? file.name : "Imagen subida"}
              className="w-full h-auto rounded-md object-contain max-h-80"
              width={100}
              height={100}
            />
            <p className="text-xs text-gray-600 mt-2 truncate">
              {file instanceof File ? file.name : "Imagen subida"}
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 flex items-center justify-center bg-red-600 text-white rounded-full h-6 w-6 hover:bg-red-700"
                aria-label="Eliminar imagen"
              >
                &#x2715; {/* Símbolo de 'X' */}
              </button>
            )}
          </div>
        ) : (
          // --- ZONA DE CARGA (cuando no hay archivo) ---
          <div
            ref={ref}
            tabIndex={-1}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`mt-1 flex justify-center p-4 border-[2px] ${borderColor} border-dashed rounded-md transition-colors`}
          >
            {/* Hacemos que toda la zona sea un label para el input oculto */}
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer w-full"
            >
              <div className="space-y-2 flex flex-col items-center justify-center text-center">
                <div className="border border-[#EAECF0] p-2 rounded-xl bg-gray-50">
                  <UploadImageIcon />
                </div>
                <p className="text-sm text-primary font-bold">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-sm text-[#767676] font-medium">
                  o haz clic para seleccionar un archivo
                </p>
                {/* Este botón ahora es puramente visual, ya que el 'label' que lo envuelve es el que tiene la funcionalidad */}
                <div className="mt-2 p-2 text-sm font-medium border border-black rounded-xl hover:bg-gray-50">
                  Seleccionar Archivo
                </div>
              </div>
            </label>
          </div>
        )}

        <p className="pt-4 text-xs text-[#5D5D5D]">
          Formatos soportados: JPG, PNG, etc. (máx. {MAX_FILE_SIZE_MB}MB)
        </p>
      </>
    );
  }
);

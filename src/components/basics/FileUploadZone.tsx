import Image from "next/image";

import UploadImageIcon from "@/src/components/icons/UploadImageIcon";
import { forwardRef, useState, useEffect, ChangeEvent, DragEvent } from "react";

type AcceptedFileTypes = "image" | "document" | "any";

interface FileUploadZoneProps {
  id?: string;
  required?: boolean;
  onFileChange?: (file: File | null) => void;
  label?: string;
  value?: File | string | null;
  disabled?: boolean;
  acceptedFileTypes?: AcceptedFileTypes; // Prop sin cambios en su definición
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fileTypeConfigs = {
  image: {
    accept: "image/*",
    errorMessage:
      "Por favor, selecciona un archivo de imagen válido (JPG, PNG, etc.).",
    supportedFormats: `Formatos soportados: JPG, PNG, etc. (máx. ${MAX_FILE_SIZE_MB}MB)`,
  },
  document: {
    accept:
      ".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    errorMessage: "Por favor, selecciona un documento válido (PDF, DOC, DOCX).",
    supportedFormats: `Formatos soportados: PDF, DOC, DOCX (máx. ${MAX_FILE_SIZE_MB}MB)`,
  },
  any: {
    accept:
      "image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    errorMessage:
      "Formato de archivo no válido. Por favor, sube una imagen o un documento.",
    supportedFormats: `Formatos: JPG, PNG, PDF, DOCX (máx. ${MAX_FILE_SIZE_MB}MB)`,
  },
};

export default forwardRef<HTMLDivElement, FileUploadZoneProps>(
  function FileUploadZone(
    {
      id = "file-upload-input",
      required,
      onFileChange,
      value,
      label = "Archivo",
      disabled = false,
      acceptedFileTypes = "image", // El valor por defecto sigue siendo 'image'
    },
    ref
  ) {
    const [file, setFile] = useState<File | string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const config = fileTypeConfigs[acceptedFileTypes];

    useEffect(() => {
      setFile(value || null);
    }, [value]);

    // Este useEffect ya funciona perfectamente para ambos casos, no necesita cambios.
    useEffect(() => {
      if (!file) {
        setPreview(null);
        return;
      }
      if (typeof file === "string") {
        setPreview(file);
        return;
      }
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
      setPreview(file.name);
    }, [file]);

    const handleFileSelected = (selectedFile: File | null) => {
      if (!selectedFile) {
        setFile(null);
        onFileChange?.(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        alert(
          `El archivo es demasiado grande. El tamaño máximo permitido es de ${MAX_FILE_SIZE_MB}MB.`
        );
        setFile(null);
        onFileChange?.(null);
        return;
      }

      // --> MODIFICADO: Lógica de validación para soportar 'any'
      let isValidType = false;
      const isImageType = selectedFile.type.startsWith("image/");
      const allowedDocTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isDocumentType = allowedDocTypes.includes(selectedFile.type);

      if (acceptedFileTypes === "image") {
        isValidType = isImageType;
      } else if (acceptedFileTypes === "document") {
        isValidType = isDocumentType;
      } else if (acceptedFileTypes === "any") {
        isValidType = isImageType || isDocumentType; // Acepta cualquiera de los dos
      }

      if (!isValidType) {
        alert(config.errorMessage);
        setFile(null);
        onFileChange?.(null);
        return;
      }

      setFile(selectedFile);
      onFileChange?.(selectedFile);
    };

    // El resto de los manejadores (onInputChange, onDrop, etc.) no necesitan cambios.
    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFileSelected(e.target.files?.[0] ?? null);
      e.target.value = "";
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFileSelected(e.dataTransfer.files?.[0] ?? null);
    };

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleRemoveFile = () => {
      setFile(null);
      onFileChange?.(null);
    };

    const borderColor = isDragging ? "border-blue-500" : "border-[#D0D5DD]";
    const containerClasses = `mt-1 flex justify-center p-4 border-[2px] ${borderColor} border-dashed rounded-md transition-colors ${
      disabled ? "bg-gray-100 cursor-not-allowed" : ""
    }`;

    // La lógica de la vista previa tampoco necesita cambios. Ya es dinámica.
    const isImageFile =
      typeof file === "string"
        ? true
        : file?.type.startsWith("image/") ?? false;

    return (
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
          htmlFor={!disabled && !preview ? id : undefined}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <input
          id={id}
          type="file"
          accept={config.accept} // Dinámico, ahora también soporta la combinación
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview && file ? (
          <div className="mt-1 relative p-2 border border-gray-300 rounded-md">
            {isImageFile ? (
              <Image
                src={preview}
                alt={file instanceof File ? file.name : "Imagen subida"}
                className="w-full h-auto rounded-md object-contain max-h-80"
                width={200}
                height={200}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-50 rounded-md">
                <UploadImageIcon />
                <p className="text-sm text-gray-800 font-medium text-center">
                  {file instanceof File ? file.name : "Archivo subido"}
                </p>
              </div>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 flex items-center justify-center bg-red-600 text-white rounded-full h-6 w-6 hover:bg-red-700 transition-colors"
                aria-label="Eliminar archivo"
              >
                &#x2715;
              </button>
            )}
          </div>
        ) : (
          <div
            ref={ref}
            tabIndex={disabled ? -1 : 0}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={containerClasses}
          >
            <label
              htmlFor={disabled ? undefined : id}
              className={
                disabled ? "cursor-not-allowed w-full" : "cursor-pointer w-full"
              }
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
                <div className="mt-2 p-2 text-sm font-medium border border-black rounded-xl hover:bg-gray-50">
                  Seleccionar Archivo
                </div>
              </div>
            </label>
          </div>
        )}
        <p className="pt-4 text-xs text-[#5D5D5D]">{config.supportedFormats}</p>
      </div>
    );
  }
);

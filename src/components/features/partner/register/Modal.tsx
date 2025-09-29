import { useEffect } from "react";
import Portal from "@/src/components/basics/Portal";
import HomeIconModal from "@/src/components/icons/HomeIconModal";

type BusinessReadyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function BusinessReadyModal({
  isOpen,
  onClose,
  onConfirm,
}: BusinessReadyModalProps) {
  // Efecto para manejar el cierre del modal con la tecla 'Escape'
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // No renderizar nada si el modal no está abierto
  if (!isOpen) {
    return null;
  }

  return (
    // Contenedor principal del modal (overlay)
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        onClick={onClose} // Cierra el modal al hacer clic en el fondo
      >
        {/* Panel del Modal */}
        <div
          className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-2xl space-y-3"
          onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal se propague al fondo
        >
          {/* Contenedor del Ícono */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary bg-teal-50">
            <HomeIconModal />
          </div>

          {/* Título Principal */}
          <h2 id="modal-title" className="text-3xl font-semibold text-gray-800">
            Ya tienes tu negocio en Reddi
          </h2>

          {/* Subtítulo */}
          <p className="text-lg text-[#767676] text-roboto">
            Empieza a gestionarlo de forma rápida y sencilla
          </p>

          {/* Línea Divisoria */}
          <div className="border-t border-[#D9DCE3] pt-3" />

          {/* Botón de Acción */}
          <button
            onClick={onConfirm}
            className="w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </Portal>
  );
}

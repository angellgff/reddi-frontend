"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCategory } from "@/src/lib/actions/admin/categories";
import BasicInput from "@/src/components/basics/BasicInput";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import BasicButton from "@/src/components/basics/BasicButton";
import Link from "next/link";
import { useState } from "react";
import InputNotice from "@/src/components/basics/InputNotice";

const initialState: { error: string | null } = {
  error: null,
};

const CategoryForm = () => {
  const [state, formAction] = useActionState(createCategory, initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = (formData: FormData) => {
    if (imageFile) {
      formData.set("image", imageFile);
    }
    // Since BasicInput might be controlled, we ensure the value is in FormData if it uses name
    // If BasicInput passes name to input, then FormData automatically picks it up from the DOM node
    // Let's verify BasicInput implementation: sends name to input. Yes.
    // So we just need to satisfy the required props of BasicInput.
    formAction(formData);
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-6 max-w-2xl bg-white p-6 rounded-lg shadow"
    >
      {state?.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <BasicInput
          id="name"
          name="name"
          label="Nombre de la Categoría"
          placeholder="Ej: Restaurantes"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          className="block w-full rounded-xl border-[#D9DCE3] border sm:text-sm p-3 font-roboto focus:outline-none focus:ring-1 focus:ring-primary/50"
          placeholder="Descripción corta de la categoría..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Imagen *
        </label>
        <FileUploadZone
          acceptedFileTypes="image"
          onFileChange={(file) => setImageFile(file as File)} // casting if needed
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Sube una imagen representativa. Formatos: JPG, PNG.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/categories">
          <BasicButton className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700">
            Cancelar
          </BasicButton>
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
};

export default CategoryForm;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <BasicButton
      type="submit"
      disabled={pending}
      className={`px-6 py-2 bg-primary text-white hover:bg-primary/90 ${pending ? "opacity-70" : ""}`}
    >
      {pending ? "Guardando..." : "Crear Categoría"}
    </BasicButton>
  );
}

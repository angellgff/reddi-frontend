"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";
import RegisterFormStep1 from "./RegisterFormStep1";
import RegisterFormStep2 from "./RegisterFormStep2";
import RegisterFormStep3 from "./RegisterFormStep3";
import RegisterFormStep4 from "./RegisterFormStep4";
import { createClient } from "@/src/lib/supabase/client";

const actualUrl = "/aliado/registro";

// Define la estructura de los datos del formulario
export interface PartnerRegisterForm {
  session: {
    email: string;
    password: string;
    confirmPassword: string;
    category: valueCategories;
  };
  bussinessData: {
    image: File | null;
    name: string;
    userRnc: string;
    phone: string;
    billingMail: string;
    isPhysical: boolean;
    address: string;
  };
  bankData: {
    holderName: string;
    accountNumber: string;
    accountType: string;
    bankRnc: string;
    document: File | null;
    conditionsAccepted: boolean;
  };
  businessHours: Hours;
}

export default function PartnerRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "1";
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PartnerRegisterForm>({
    session: {
      email: "",
      password: "",
      confirmPassword: "",
      category: "market",
    },
    bussinessData: {
      image: null,
      name: "",
      userRnc: "",
      phone: "",
      billingMail: "",
      isPhysical: false,
      address: "",
    },
    bankData: {
      holderName: "",
      accountNumber: "",
      accountType: "",
      bankRnc: "",
      document: null,
      conditionsAccepted: false,
    },
    businessHours: {
      monday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      tuesday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      wednesday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      thursday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      friday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      saturday: { active: false, opens: "08:00:00", closes: "17:00:00" },
    },
  });

  useEffect(() => {
    console.log(formData);

    return () => {
      console.log("Cleaning up form data log...");
    };
  }, [formData]);

  // --- HANDLER PARA EL PASO 1: DATOS DE SESIÓN ---
  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        [name]: value,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 2: DATOS DEL NEGOCIO ---
  const handleBusinessDataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "isPhysical") {
      if (value === "yes") {
        setFormData((prev) => ({
          ...prev,
          bussinessData: { ...prev.bussinessData, isPhysical: true },
        }));
        return;
      } else {
        setFormData((prev) => ({
          ...prev,
          bussinessData: { ...prev.bussinessData, isPhysical: false },
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      bussinessData: {
        ...prev.bussinessData,
        [name]: value,
      },
    }));
  };

  // Manejador para el FileUploadButton del paso 2
  const handleFileChange2 = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      bussinessData: {
        ...prev.bussinessData,
        image: file,
      },
    }));
  };

  // Manejador para el FileUploadButton del paso 3
  const handleFileChange3 = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      bankData: {
        ...prev.bankData,
        document: file,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 3: DATOS BANCARIOS ---
  // Este es más flexible para manejar inputs de archivo y checkboxes
  const handleBankDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "conditionsAccepted") {
      if (value === "yes") {
        setFormData((prev) => ({
          ...prev,
          bankData: { ...prev.bankData, conditionsAccepted: true },
        }));
        return;
      } else {
        setFormData((prev) => ({
          ...prev,
          bankData: { ...prev.bankData, conditionsAccepted: false },
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      bankData: {
        ...prev.bankData,
        [name]: value,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 4: HORARIO COMERCIAL ---
  // Este necesita saber el día específico que se está modificando
  const handleBusinessHoursChange = (
    day: keyof PartnerRegisterForm["businessHours"],
    field: keyof PartnerRegisterForm["businessHours"]["monday"], // 'active', 'opens', o 'closes'
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  // Efecto para validar el paso actual y los campos requeridos
  useEffect(() => {
    const validSteps = ["1", "2", "3", "4"];
    const requiredFieldsStep2: (keyof PartnerRegisterForm["bussinessData"])[] =
      ["name", "userRnc", "phone", "billingMail", "address"];

    // Verifica que se esté en un paso válido
    if (!validSteps.includes(currentStep || "")) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    // No se puede acceder a pasos posteriores sin completar los previos
    if (
      currentStep === "2" &&
      Object.values(formData.session).some((v) => !v)
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    if (
      currentStep === "3" &&
      requiredFieldsStep2.some(
        (field) =>
          !formData.bussinessData[field as keyof typeof formData.bussinessData]
      )
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    if (
      currentStep === "4" &&
      Object.values(formData.bankData).some((v) => !v)
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
  }, [currentStep, router, formData]);

  // Guardias para renderizar el paso correcto o nada
  if (!["1", "2", "3", "4"].includes(currentStep || "")) {
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    console.info("[handleSubmit: START] - Proceso de registro iniciado.");

    // Variables para guardar referencias y poder limpiar en caso de error
    let createdUserId: string | null = null;
    let uploadedImagePath: string | null = null;
    let uploadedDocumentPath: string | null = null;

    try {
      // --- 1. Crear el usuario en Supabase Auth ---
      console.info(
        "[handleSubmit: Step 1] - Intentando crear usuario con email:",
        formData.session.email
      );
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.session.email,
        password: formData.session.password,
        options: {
          data: {
            role: "admin", // O el rol de partner que hayas definido
            partner_type: formData.session.category,
          },
        },
      });

      if (authError) {
        console.error(
          "[handleSubmit: Step 1 FAILED] - Error en signUp:",
          authError
        );
        throw authError;
      }
      if (!authData.user) {
        throw new Error("Respuesta de Supabase Auth no contiene un usuario.");
      }

      createdUserId = authData.user.id;
      console.info(
        `[handleSubmit: Step 1 SUCCESS] - Usuario creado con ID: ${createdUserId}`
      );

      // --- 2. Subir la imagen del negocio (si existe) ---
      let imageUrl: string | null = null;
      if (formData.bussinessData.image) {
        const imageFile = formData.bussinessData.image;
        const filePath = `${createdUserId}/${Date.now()}_${imageFile.name}`;
        console.info(
          `[handleSubmit: Step 2] - Intentando subir imagen a Storage en: business-images/${filePath}`
        );
        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(filePath, imageFile);
        if (uploadError) {
          console.error(
            "[handleSubmit: Step 2 FAILED] - Error subiendo imagen:",
            uploadError
          );
          throw uploadError;
        }
        uploadedImagePath = filePath;
        const { data: publicUrlData } = supabase.storage
          .from("business-images")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
        console.info(
          `[handleSubmit: Step 2 SUCCESS] - Imagen subida. URL pública: ${imageUrl}`
        );
      } else {
        console.info(
          "[handleSubmit: Step 2 SKIPPED] - No se proporcionó imagen de negocio."
        );
      }

      // --- 3. Subir el documento bancario (si existe) ---
      let documentUrl: string | null = null;
      if (formData.bankData.document) {
        const docFile = formData.bankData.document;
        const docPath = `${createdUserId}/${Date.now()}_${docFile.name}`;
        console.info(
          `[handleSubmit: Step 3] - Intentando subir documento a Storage en: bank-documents/${docPath}`
        );
        const { error: docUploadError } = await supabase.storage
          .from("bank-documents")
          .upload(docPath, docFile);
        if (docUploadError) {
          console.error(
            "[handleSubmit: Step 3 FAILED] - Error subiendo documento:",
            docUploadError
          );
          throw docUploadError;
        }
        uploadedDocumentPath = docPath;
        documentUrl = docPath;
        console.info(
          `[handleSubmit: Step 3 SUCCESS] - Documento subido a la ruta: ${documentUrl}`
        );
      } else {
        console.info(
          "[handleSubmit: Step 3 SKIPPED] - No se proporcionó documento bancario."
        );
      }

      // --- 4. Insertar todos los datos en las tablas 'partners' y la tabla específica ---

      // =========================================================================
      // CORRECCIÓN PRINCIPAL AQUÍ: COMPLETAR EL OBJETO DE DATOS PARA 'partners'
      // =========================================================================
      const partnerDataToInsert = {
        // Claves principales
        id: createdUserId,
        user_id: createdUserId,
        partner_type: formData.session.category,

        // Datos del negocio (bussinessData)
        name: formData.bussinessData.name,
        image_url: imageUrl,
        user_rnc: formData.bussinessData.userRnc,
        phone: formData.bussinessData.phone,
        billing_email: formData.bussinessData.billingMail,
        is_physical: formData.bussinessData.isPhysical,
        address: formData.bussinessData.address,

        // Datos bancarios (bankData)
        bank_holder_name: formData.bankData.holderName,
        bank_account_number: formData.bankData.accountNumber,
        bank_account_type: formData.bankData.accountType,
        bank_rnc: formData.bankData.bankRnc,
        bank_document_url: documentUrl,
        conditions_accepted: formData.bankData.conditionsAccepted,

        // Horario comercial (businessHours)
        business_hours: formData.businessHours,
      };

      console.log(
        "[handleSubmit: Step 4] - Datos a insertar en 'partners':",
        partnerDataToInsert
      );

      const { error: insertPartnerError } = await supabase
        .from("partners")
        .insert(partnerDataToInsert);
      if (insertPartnerError) {
        console.error(
          "[handleSubmit: Step 4 FAILED] - Error insertando en 'partners':",
          insertPartnerError
        );
        throw insertPartnerError;
      }
      console.log(
        "[handleSubmit: Step 4 SUCCESS] - Datos insertados en 'partners'."
      );

      // --- 4.b. Inserción en la tabla específica (markets, restaurants, etc.) ---
      const partnerType = formData.session.category;
      let specificTable = "";
      if (partnerType === "market") specificTable = "markets";
      if (partnerType === "restaurant") specificTable = "restaurants";
      // ... añade más casos si tienes más tipos

      if (specificTable) {
        console.log(
          `[handleSubmit: Step 4.b] - Insertando ID en tabla específica '${specificTable}'...`
        );
        const { error: insertSpecificError } = await supabase
          .from(specificTable)
          .insert({
            id: createdUserId,
            // Aquí irían los campos específicos de ese tipo de negocio si los tuvieras en el formulario
          });
        if (insertSpecificError) {
          console.error(
            `[handleSubmit: Step 4.b FAILED] - Error insertando en '${specificTable}':`,
            insertSpecificError
          );
          throw insertSpecificError;
        }
        console.log(
          `[handleSubmit: Step 4.b SUCCESS] - ID insertado en '${specificTable}'.`
        );
      }

      // --- 5. Éxito ---
      console.info(
        "[handleSubmit: SUCCESS] - Proceso completado. Redirigiendo..."
      );
      router.push("/aliado/dashboard?registro=exitoso");
    } catch (error: any) {
      // --- Bloque de Manejo de Errores y Limpieza ---
      console.error(
        "====================== ERROR CAPTURADO ======================"
      );
      console.error(
        "Fallo en el registro, iniciando limpieza. Objeto de error completo:",
        error
      );
      console.error("Tipo de error:", typeof error);
      console.error("Mensaje de error:", error?.message);
      console.error("Stack de error:", error?.stack);
      console.error(
        "============================================================"
      );

      setError(
        error.message ||
          "Ocurrió un error inesperado. Revisa la consola para más detalles."
      );

      // Lógica de Rollback/Limpieza
      if (uploadedImagePath) {
        console.warn(
          `[Rollback] - Intentando eliminar imagen: ${uploadedImagePath}`
        );
        await supabase.storage
          .from("business-images")
          .remove([uploadedImagePath]);
      }
      if (uploadedDocumentPath) {
        console.warn(
          `[Rollback] - Intentando eliminar documento: ${uploadedDocumentPath}`
        );
        await supabase.storage
          .from("bank-documents")
          .remove([uploadedDocumentPath]);
      }

      if (createdUserId) {
        console.warn(
          `[Rollback] - El usuario con ID ${createdUserId} fue creado pero el proceso falló. ` +
            `Debe ser eliminado manualmente o a través de una función de limpieza en el backend.`
        );
      }
    } finally {
      // --- Este bloque se ejecuta SIEMPRE ---
      setIsSubmitting(false);
      console.info(
        "[handleSubmit: FINALLY] - Proceso de envío finalizado (con éxito o error)."
      );
    }
  };

  switch (currentStep) {
    case "1":
      return (
        <RegisterFormStep1
          formData={formData}
          onChange={handleSessionChange}
          onGoBack={() => router.push(`/`)}
          onNextStep={() => router.push(`${actualUrl}?step=2`)}
        />
      );
    case "2":
      return (
        <RegisterFormStep2
          formData={formData}
          onChange={handleBusinessDataChange}
          onFileChange={handleFileChange2}
          onGoBack={() => router.push(`${actualUrl}?step=1`)}
          onNextStep={() => router.push(`${actualUrl}?step=3`)}
        />
      );
    case "3":
      return (
        <RegisterFormStep3
          formData={formData}
          onChange={handleBankDataChange}
          onFileChange={handleFileChange3}
          onGoBack={() => router.push(`${actualUrl}?step=2`)}
          onNextStep={() => router.push(`${actualUrl}?step=4`)}
        />
      );
    case "4":
      return (
        <RegisterFormStep4
          formData={formData}
          onChange={handleBusinessHoursChange}
          onGoBack={() => router.push(`${actualUrl}?step=3`)}
          onNextStep={handleSubmit} // ¡Aquí conectamos la función de envío!
          isSubmitting={isSubmitting} // Pasamos el estado de carga
          error={error} // Pasamos el mensaje de error para mostrarlo en la UI
        />
      );
    default:
      return null;
  }
}

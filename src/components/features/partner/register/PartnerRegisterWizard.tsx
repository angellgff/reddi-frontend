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

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

    let createdUserId: string | null = null;
    let uploadedImagePath: string | null = null;
    let uploadedDocumentPath: string | null = null;

    try {
      // --- 1. Crear el usuario de forma NATIVA ---
      // Esto es mucho más fiable.
      console.info("[handleSubmit] Step 1: Creating user natively...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.session.email,
        password: formData.session.password,
        options: {
          data: {
            // Aún podemos pasar metadatos, aunque nuestra RPC no los use directamente.
            // Es bueno para tenerlo en la tabla auth.users.
            role: "admin",
            partner_type: formData.session.category,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");

      createdUserId = authData.user.id;
      console.info(`[handleSubmit] User created with ID: ${createdUserId}`);

      // --- 2. Preparar y enviar datos a la Edge Function ---
      const partnerData = {
        category: formData.session.category,
        name: formData.bussinessData.name,
        userRnc: formData.bussinessData.userRnc,
        phone: formData.bussinessData.phone,
        billingMail: formData.bussinessData.billingMail,
        isPhysical: formData.bussinessData.isPhysical,
        address: formData.bussinessData.address,
        holderName: formData.bankData.holderName,
        accountNumber: formData.bankData.accountNumber,
        accountType: formData.bankData.accountType,
        bankRnc: formData.bankData.bankRnc,
        conditionsAccepted: formData.bankData.conditionsAccepted,
        businessHours: formData.businessHours,
      };

      console.info(
        "[handleSubmit] Step 2: Calling Edge Function to complete profile..."
      );
      const { error: functionError } = await supabase.functions.invoke(
        "complete-partner-registration",
        { body: { userId: createdUserId, partnerData } }
      );

      if (functionError) {
        // Si la Edge Function falla, la transacción se revirtió.
        // El usuario existe pero sin perfil.
        throw new Error(
          `Failed to create partner profile: ${functionError.message}`
        );
      }
      console.info("[handleSubmit] Edge Function executed successfully.");

      // --- 3. Subir archivos y actualizar URLs (flujo ya conocido) ---
      // Para esto, primero necesitamos iniciar sesión.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.session.email,
        password: formData.session.password,
      });
      if (signInError) throw new Error("Sign in after registration failed.");

      // --- 3. Subir archivos (ahora que sabemos que el usuario existe) ---
      let imageUrl: string | null = null;
      if (formData.bussinessData.image) {
        const imageFile = formData.bussinessData.image;
        const filePath = `${createdUserId}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        uploadedImagePath = filePath; // Guardar para posible rollback
        const { data: publicUrlData } = supabase.storage
          .from("business-images")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      let documentUrl: string | null = null;
      if (formData.bankData.document) {
        const docFile = formData.bankData.document;
        const docPath = `${createdUserId}/${Date.now()}_${docFile.name}`;
        const { error: docUploadError } = await supabase.storage
          .from("bank-documents")
          .upload(docPath, docFile);
        if (docUploadError) throw docUploadError;
        uploadedDocumentPath = docPath; // Guardar para posible rollback
        documentUrl = docPath; // O la URL pública si la necesitas
      }

      // --- 4. Actualizar el registro 'partners' con las URLs de los archivos ---
      // Esta es una operación pequeña y de bajo riesgo.
      if (imageUrl || documentUrl) {
        console.info(
          "[handleSubmit: Step 4] - Actualizando URLs de archivos..."
        );
        const { error: updateError } = await supabase
          .from("partners")
          .update({
            image_url: imageUrl,
            bank_document_url: documentUrl,
          })
          .eq("id", createdUserId);

        if (updateError) throw updateError;
      }

      // --- 5. Éxito ---
      console.info(
        "[handleSubmit: SUCCESS] - Proceso completado. Redirigiendo..."
      );
      router.push("/aliado/dashboard?registro=exitoso");
    } catch (error: any) {
      console.error(
        "====================== ERROR CAPTURADO ======================",
        error
      );

      // --- NUEVA LÓGICA DE MANEJO DE ERRORES ---
      let friendlyErrorMessage =
        "Ocurrió un error inesperado. Por favor, intenta de nuevo.";

      // Detectar el error de email duplicado
      if (
        error.code === "23505" ||
        (error.message && error.message.includes("duplicate key value"))
      ) {
        friendlyErrorMessage =
          "Este correo electrónico ya está registrado. Por favor, usa otro o inicia sesión.";
      }
      // Podrías añadir más `else if` para otros errores comunes, como contraseñas débiles.
      else if (error.message) {
        // Para otros errores de la base de datos, puedes mostrar su mensaje si es seguro.
        friendlyErrorMessage = error.message;
      }

      setError(friendlyErrorMessage); // ¡Usamos el mensaje amigable!

      // La lógica de Rollback de archivos sigue siendo válida
      if (uploadedImagePath) {
        await supabase.storage
          .from("business-images")
          .remove([uploadedImagePath]);
      }
      if (uploadedDocumentPath) {
        await supabase.storage
          .from("bank-documents")
          .remove([uploadedDocumentPath]);
      }
    } finally {
      setIsSubmitting(false);
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

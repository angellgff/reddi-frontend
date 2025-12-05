"use server";

import { createClient } from "@/src/lib/supabase/server";
// Importamos el cliente 'vanilla' de supabase para crear la instancia admin
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Definimos el tipo para el estado del formulario
type FormState = {
  error?: string;
  success?: boolean;
} | null;

export async function registerPartner(
  prevState: FormState,
  formData: FormData
) {
  // 1. Cliente normal para Auth (para mantener el contexto de sesión del usuario)
  const supabase = await createClient();

  // 2. Cliente ADMIN para Storage (Bypassea RLS para evitar el error 403)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // ... [Extracción de datos: email, password, etc. SE MANTIENE IGUAL] ...
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const category = formData.get("category") as string;

  // Business Data
  const name = formData.get("name") as string;
  const userRnc = formData.get("userRnc") as string;
  const phone = formData.get("phone") as string;
  const billingMail = formData.get("billingMail") as string;
  const isPhysical = formData.get("isPhysical") === "true";
  const address = formData.get("address") as string;
  const lat = formData.get("lat")
    ? parseFloat(formData.get("lat") as string)
    : null;
  const lng = formData.get("lng")
    ? parseFloat(formData.get("lng") as string)
    : null;
  const imageFile = formData.get("image") as File | null;

  // Bank Data
  const holderName = formData.get("holderName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountType = formData.get("accountType") as string;
  const bankRnc = formData.get("bankRnc") as string;
  const conditionsAccepted = formData.get("conditionsAccepted") === "true";
  const documentFile = formData.get("document") as File | null;

  // Hours
  const businessHoursStr = formData.get("businessHours") as string;
  const businessHours = businessHoursStr ? JSON.parse(businessHoursStr) : {};

  let createdUserId: string | null = null;
  let uploadedImagePath: string | null = null;
  let uploadedDocumentPath: string | null = null;

  try {
    // --- Lógica de App Role ---
    let appRole = "market";
    if (category === "restaurant") {
      appRole = "restaurant";
    }

    // --- SignUp ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: appRole,
          partner_type: category,
          full_name: name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed.");
    createdUserId = authData.user.id;

    // --- RPC Call ---
    const partnerDataForDb = {
      firstName: name,
      lastName: "",
      category: category,
      name: name,
      userRnc: userRnc,
      phone: phone,
      billingMail: billingMail,
      isPhysical: isPhysical,
      address: address,
      lat: lat,
      lng: lng,
      imageUrl: null,
      bankDocumentUrl: null,
      holderName: holderName,
      accountNumber: accountNumber,
      accountType: accountType,
      bankRnc: bankRnc,
      conditionsAccepted: conditionsAccepted,
      businessHours: businessHours,
      cuisineType: null,
      hasOutdoorSeating: false,
      licenseNumber: null,
      specializesIn: null,
    };

    const { error: rpcError } = await supabase.rpc("complete_partner_profile", {
      partner_data: partnerDataForDb,
    });

    if (rpcError) throw new Error(`Error guardando datos: ${rpcError.message}`);

    // --- Sign In (Para sesión del usuario) ---
    await supabase.auth.signInWithPassword({ email, password });

    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileBuffer = await imageFile.arrayBuffer();
      // Usamos Buffer.from para asegurar compatibilidad en entorno Node
      const buffer = Buffer.from(fileBuffer);
      const fileExt = imageFile.name.split(".").pop(); // Obtener extensión (jpg, png)
      const filePath = `${createdUserId}/${Date.now()}_logo.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("business-images")
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;
      uploadedImagePath = filePath;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("business-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Lógica de DOCUMENTO BANCARIO (Corrección aquí)
    let documentUrl: string | null = null;

    if (documentFile && documentFile.size > 0) {
      const fileBuffer = await documentFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Corrección 1: Mantener la extensión del archivo original
      const fileExt = documentFile.name.split(".").pop();
      // Corrección 2: Sanitizar nombre (opcional, pero ayuda a evitar errores con espacios)
      const fileNameSanitized = documentFile.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      );

      const docPath = `${createdUserId}/${Date.now()}_${fileNameSanitized}`;

      const { error: docUploadError } = await supabaseAdmin.storage
        .from("bank-documents")
        .upload(docPath, buffer, {
          contentType: documentFile.type,
          upsert: true,
        });

      if (docUploadError) throw docUploadError;
      uploadedDocumentPath = docPath;

      // Corrección 3: Generar la URL Pública (esto faltaba)
      const { data: publicDocUrlData } = supabaseAdmin.storage
        .from("bank-documents")
        .getPublicUrl(docPath);

      documentUrl = publicDocUrlData.publicUrl;
    }

    // --- Update Final ---
    if (imageUrl || documentUrl) {
      const { error: updateError } = await supabaseAdmin
        .from("partners")
        .update({
          image_url: imageUrl,
          bank_document_url: documentUrl, // Ahora sí es una URL completa
        })
        .eq("id", createdUserId);

      if (updateError) throw updateError;
    }
  } catch (err: unknown) {
    // Casteamos el error para acceder a sus propiedades de forma segura
    const error = err as { message?: string; code?: string };
    console.error("Registration error:", error);

    // Rollback usando Admin
    // 1. Borrar imagen si se subió
    if (uploadedImagePath) {
      await supabaseAdmin.storage
        .from("business-images")
        .remove([uploadedImagePath]);
    }

    // 2. Borrar documento si se subió (Soluciona el error de variable no usada)
    if (uploadedDocumentPath) {
      await supabaseAdmin.storage
        .from("bank-documents")
        .remove([uploadedDocumentPath]);
    }

    let friendly = "Ocurrió un error inesperado.";
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      friendly = "Este correo electrónico ya está registrado.";
    } else if (error.message) {
      friendly = error.message;
    }
    return { error: friendly };
  }

  redirect("/aliado/dashboard?registro=exitoso");
}

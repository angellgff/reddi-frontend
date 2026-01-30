"use server";

import { createClient } from "@/src/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

// Definimos el tipo para el estado del formulario
type FormState = {
  error?: string;
  success?: boolean;
} | null;

export async function registerPartner(
  prevState: FormState,
  formData: FormData,
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
    },
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

  // --- VALIDACIÓN BÁSICA DEL SERVIDOR ---
  if (!email || !password || !name) {
    return { error: "Faltan campos obligatorios (email, password, nombre)." };
  }
  if (!conditionsAccepted) {
    return { error: "Debes aceptar los términos y condiciones." };
  }

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
    // Si no hay user, lanzamos error (aunque signUp suele devolver user o error)
    if (!authData.user) throw new Error("User creation failed.");

    createdUserId = authData.user.id;
    // IMPORTANTE: Al crear el usuario, el trigger "on_auth_user_created"
    // debería crear la entrada en "profiles" automáticamente.

    // --- Insert en Partners (Reemplazo RPC) ---
    // Preparamos coordenadas en formato GeoJSON si existen
    let coordinates = null;
    // PostGIS espera el formato "POINT(lng lat)"
    // Importante: Longitud primero, espacio en medio (no coma).
    if (lat && lng) {
      coordinates = `POINT(${lng} ${lat})`;
    }

    // Insertar Partner
    const { data: partnerData, error: insertError } = await supabaseAdmin
      .from("partners")
      .insert({
        id: createdUserId, // <--- ESTO FALTABA: Forzamos que el ID sea el mismo del usuario
        user_id: createdUserId, // Mantenemos la FK explícita también
        name: name,
        partner_type: category as any,
        user_rnc: userRnc,
        phone: phone,
        billing_email: billingMail,
        is_physical: isPhysical,
        address: address,
        coordinates: coordinates,
        bank_holder_name: holderName,
        bank_account_number: accountNumber,
        bank_account_type: accountType,
        bank_rnc: bankRnc,
        conditions_accepted: conditionsAccepted,
        business_hours: businessHours,
        // Campos por defecto
        is_approved: false,
        is_active: false,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Error insertando partner: ${insertError.message}`);
    }

    const partnerId = partnerData.id;

    // --- Insertar en Sub-tablas según categoría ---
    // Usamos Promesas para no bloquear si hay varios inserts (aunque aquí es uno)
    if (category === "restaurant") {
      const { error: restError } = await supabaseAdmin
        .from("restaurants")
        .insert({
          id: partnerId,
          cuisine_type: null,
          has_outdoor_seating: false,
        });
      if (restError)
        throw new Error(
          `Error creando restaurant detalles: ${restError.message}`,
        );
    } else if (category === "liquor_store") {
      const { error: liquorError } = await supabaseAdmin
        .from("liquor_stores")
        .insert({
          id: partnerId,
          license_number: null,
          specializes_in: null,
        });
      if (liquorError)
        throw new Error(
          `Error creando liquor store detalles: ${liquorError.message}`,
        );
    } else if (category === "market") {
      const { error: marketError } = await supabaseAdmin
        .from("markets")
        .insert({
          id: partnerId,
          has_bakery: null,
          has_butchery: null,
        });
      if (marketError)
        throw new Error(
          `Error creando market detalles: ${marketError.message}`,
        );
    } else if (category === "pharmacy") {
      const { error: pharmError } = await supabaseAdmin
        .from("pharmacies")
        .insert({
          id: partnerId,
          is_on_duty: false,
          license_number: null,
        });
      if (pharmError)
        throw new Error(
          `Error creando pharmacy detalles: ${pharmError.message}`,
        );
    }
    // Si hay otras categorías como 'tobacco' que no tienen tabla específica, no hacemos nada extra.

    // --- Subida de Imágenes (Mantenemos lógica) ---
    // Ya NO hacemos signInWithPassword porque el usuario no está verificado aún.

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
      // Corrección 2: Sanitizar nombre (opcional, pero ayuda a evitar errores con espacios)
      const fileNameSanitized = documentFile.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_",
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
        .eq("id", partnerId); // Usamos partnerId devuelto por insert

      if (updateError) throw updateError;
    }
  } catch (err: unknown) {
    Sentry.captureException(err);
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

    // 2. Borrar documento si se subió
    if (uploadedDocumentPath) {
      await supabaseAdmin.storage
        .from("bank-documents")
        .remove([uploadedDocumentPath]);
    }

    // 3. MANUAL ROLLBACK: Borrar el usuario de Authentication
    //    Si algo falló después de crear el auth user, lo borramos para no dejar "basura".
    if (createdUserId) {
      console.log(
        `[Rollback] Eliminando usuario ${createdUserId} por fallo en proceso.`,
      );
      const { error: deleteUserError } =
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      if (deleteUserError) {
        console.error(
          "Error crítico durante rollback (deleteUser):",
          deleteUserError,
        );
      }
    }

    let friendly = "Ocurrió un error inesperado al registrar el aliado.";
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      friendly = "Este correo electrónico ya está registrado.";
    } else if (error.message) {
      friendly = error.message;
    }
    return { error: friendly };
  }

  redirect("/aliado/dashboard?registro=exitoso");
}

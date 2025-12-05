import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    // 1. Validar entorno
    const merchantId = process.env.AZUL_MERCHANT_ID;
    const privateKey = process.env.AZUL_PRIVATE_KEY;
    const paymentUrl = process.env.AZUL_PAYMENT_URL;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!merchantId || !privateKey || !paymentUrl || !baseUrl) {
      console.error("Faltan variables en .env.local");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // 2. FORMATEO DE MONTO (SEGÚN DOCUMENTACIÓN)
    // Regla: "Sin coma ni punto. 1000 equivale a 10.00"
    // Solución: Multiplicar por 100 y convertir a entero.
    const numericAmount = Number(amount);

    // Convertir 1250.50 -> 125050
    const amountInt = Math.round(numericAmount * 100).toString();

    // ITBIS: Enviamos "000" (que equivale a 0.00) para evitar problemas de cálculo fiscal por ahora.
    const itbisInt = "000";

    // 3. Datos fijos
    const merchantName = "Mi Comercio";
    const merchantType = "Ecommerce";
    const currencyCode = "$"; // Verificar en tu correo de bienvenida si es "$" o "DOP"

    const approvedUrl = `${baseUrl}/user/checkout/azul-callback?status=success`;
    const declinedUrl = `${baseUrl}/user/checkout/azul-callback?status=declined`;
    const cancelUrl = `${baseUrl}/user/checkout/address`;

    // Campos Custom (Obligatorios en el Hash aunque sean 0 o vacíos)
    const useCustomField1 = "0";
    const customField1Label = "";
    const customField1Value = "";

    const useCustomField2 = "0";
    const customField2Label = "";
    const customField2Value = "";

    // 4. CONSTRUCCIÓN DEL HASH (SEGÚN TABLA DE DOCUMENTACIÓN)
    // El orden es: MerchantID + MerchantName + MerchantType + CurrencyCode + OrderNumber + Amount + ITBIS + ApprovedUrl + DeclinedUrl + CancelUrl + UseCustomField1 + CustomField1Label + CustomField1Value + UseCustomField2 + CustomField2Label + CustomField2Value + AuthKey

    const dataToSign =
      merchantId +
      merchantName +
      merchantType +
      currencyCode +
      orderId +
      amountInt + // "1000"
      itbisInt + // "000"
      approvedUrl +
      declinedUrl +
      cancelUrl +
      useCustomField1 + // "0"
      customField1Label + // ""
      customField1Value + // ""
      useCustomField2 + // "0"
      customField2Label + // ""
      customField2Value + // ""
      privateKey; // Tu llave secreta

    // Generar HMAC SHA-512
    const authHash = crypto
      .createHmac("sha512", privateKey)
      .update(dataToSign)
      .digest("hex");

    console.log("Datos enviados a AZUL:", { orderId, amountInt, itbisInt });

    return NextResponse.json({
      url: paymentUrl,
      fields: {
        MerchantId: merchantId,
        MerchantName: merchantName,
        MerchantType: merchantType,
        CurrencyCode: currencyCode,
        OrderNumber: orderId,
        Amount: amountInt, // Enviamos formato entero
        ITBIS: itbisInt, // ¡OJO! La doc dice ITBIS (mayúsculas), antes usábamos Itbis
        ApprovedUrl: approvedUrl,
        DeclinedUrl: declinedUrl,
        CancelUrl: cancelUrl,
        UseCustomField1: useCustomField1,
        CustomField1Label: customField1Label,
        CustomField1Value: customField1Value,
        UseCustomField2: useCustomField2,
        CustomField2Label: customField2Label,
        CustomField2Value: customField2Value,
        AuthHash: authHash,
        // Opcionales según doc
        ShowTransactionResult: "1",
        Locale: "ES",
      },
    });
  } catch (error) {
    console.error("Error firmando pago AZUL:", error);
    return NextResponse.json(
      { error: "Error interno de firma" },
      { status: 500 }
    );
  }
}

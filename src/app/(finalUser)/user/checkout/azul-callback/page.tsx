import { updateOrderAfterPayment } from "@/src/lib/actions/orders";
import PaymentStatusView from "./payment-status-view";

export default async function AzulCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // 1. Extraer TODOS los datos importantes que manda Azul
  const azulParams = {
    orderId: params.OrderNumber as string, // ID de la orden en Supabase
    amount: params.Amount as string,
    authCode: params.AuthorizationCode as string,
    rrn: params.RRN as string, // Referencia única importante
    responseCode: params.ResponseCode as string,
    responseMessage: params.ResponseMessage as string,
    cardNumber: params.CardNumber as string, // Viene enmascarada ****1234
    errorDesc: params.ErrorDescription as string,
    dateTime: params.DateTime as string,
    azulOrderId: params.AzulOrderId as string,
  };

  const ourStatus = params.status as string; // 'success' o 'declined' que pusimos nosotros

  let status: "success" | "error" = "error";
  let message = "Verificando transacción con el banco...";

  if (!azulParams.orderId) {
    status = "error";
    message = "Error: No se recibió el número de orden.";
  } else if (ourStatus === "success" && azulParams.responseCode === "ISO8583") {
    // 2. VALIDACIÓN: ¿El banco dijo que sí? (ISO8583 = Aprobado)
    try {
      // 3. ACTUALIZAR BASE DE DATOS (Server Action called directly)
      const result = await updateOrderAfterPayment(
        azulParams.orderId,
        azulParams
      );

      if (!result.success) {
        console.error("Error actualizando orden:", result.error);
        status = "error";
        message =
          "El pago fue cobrado por el banco, pero hubo un error actualizando tu orden en nuestra app. Por favor contacta soporte.";
      } else {
        status = "success";
        message = `¡Pago Aprobado! Ref: ${azulParams.authCode}`;
        // Nota: La limpieza del carrito (Redux) se maneja en el componente cliente PaymentStatusView
        // cuando recibe status="success".
      }
    } catch (err) {
      console.error("Error actualizando orden:", err);
      status = "error";
      message =
        "El pago fue cobrado por el banco, pero hubo un error actualizando tu orden en nuestra app. Por favor contacta soporte.";
    }
  } else {
    // CASO DECLINADO O ERROR
    status = "error";
    // Azul a veces manda el error en ErrorDescription, si no, usamos el ResponseMessage
    const reason =
      azulParams.errorDesc ||
      azulParams.responseMessage ||
      "Transacción no completada";
    message = `Pago no realizado: ${decodeURIComponent(reason)}`;
  }

  return (
    <PaymentStatusView
      status={status}
      message={message}
      orderId={azulParams.orderId}
    />
  );
}

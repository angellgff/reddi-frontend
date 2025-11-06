import { Resend } from "resend";

// Ensure the API key is loaded from environment
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  // We don't throw to avoid crashing SSR; log once.
  console.warn(
    "[email] RESEND_API_KEY no definido. Los correos no se enviarán."
  );
}

// Lazy instance to avoid creating when no key
const resend = apiKey ? new Resend(apiKey) : null;
if (resend) {
  console.info("[email] Resend inicializado (API key presente)");
}

// Basic types for order events
export interface OrderCreatedEmailData {
  orderId: string;
  userEmail: string; // destinatario
  totalFormatted: string;
  itemsSummary?: string; // texto breve
}

export interface OrderStatusChangedEmailData {
  orderId: string;
  userEmail: string;
  oldStatus: string;
  newStatus: string;
}

// Helper to build a simple HTML layout
function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html><html lang="es"><head><meta charSet="utf-8" />
<style>body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.4;color:#222;padding:24px;background:#f7f7f9;}h1{font-size:20px;margin:0 0 16px;}p{margin:0 0 12px;}small{color:#555}</style>
<title>${title}</title></head><body><h1>${title}</h1>${body}<hr/><small>Este correo fue generado automáticamente. No respondas a este email.</small></body></html>`;
}

// Send when order created
export async function sendOrderCreatedEmail(data: OrderCreatedEmailData) {
  if (!resend) return { skipped: true, reason: "missing_api_key" };
  try {
    console.info("[email] Enviando correo: pedido creado", {
      orderId: data.orderId,
      to: "zagon.tech@gmail.com",
    });
    const html = wrapHtml(
      "Pedido recibido",
      `<p>Tu pedido <strong>#${
        data.orderId
      }</strong> fue creado correctamente.</p>
<p>Total: <strong>${data.totalFormatted}</strong></p>
${data.itemsSummary ? `<p>Resumen: ${data.itemsSummary}</p>` : ""}
<p>Te avisaremos del progreso.</p>`
    );
    const resp = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "zagon.tech@gmail.com",
      subject: `Pedido #${data.orderId} recibido`,
      html,
    });
    console.info("[email] Respuesta Resend (pedido creado)", {
      id: resp.data?.id,
      // Resend SDK expone .error opcionalmente; no hacemos cast, sólo reportamos si existe.
      hasError: Boolean((resp as unknown as { error?: unknown }).error),
    });
    return { ok: true, id: resp.data?.id };
  } catch (e) {
    console.error("[email] Error enviando correo de pedido creado", e);
    return { ok: false, error: (e as Error).message };
  }
}

// Send when status changed
export async function sendOrderStatusChangedEmail(
  data: OrderStatusChangedEmailData
) {
  if (!resend) return { skipped: true, reason: "missing_api_key" };
  try {
    console.info("[email] Enviando correo: cambio de estado", {
      orderId: data.orderId,
      to: "zagon.tech@gmail.com",
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
    });
    const html = wrapHtml(
      "Estado de tu pedido actualizado",
      `<p>El estado de tu pedido <strong>#${data.orderId}</strong> cambió de <strong>${data.oldStatus}</strong> a <strong>${data.newStatus}</strong>.</p>
<p>Gracias por usar Reddi.</p>`
    );
    const resp = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "zagon.tech@gmail.com",
      subject: `Pedido #${data.orderId} ahora está en ${data.newStatus}`,
      html,
    });
    console.info("[email] Respuesta Resend (cambio de estado)", {
      id: resp.data?.id,
      hasError: Boolean((resp as unknown as { error?: unknown }).error),
    });
    return { ok: true, id: resp.data?.id };
  } catch (e) {
    console.error("[email] Error enviando correo de cambio de estado", e);
    return { ok: false, error: (e as Error).message };
  }
}

// Generic email function (optional public usage)
export async function sendGenericEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) return { skipped: true, reason: "missing_api_key" };
  try {
    console.info("[email] Enviando correo genérico", { to, subject });
    const resp = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    console.info("[email] Respuesta Resend (genérico)", {
      id: resp.data?.id,
      hasError: Boolean((resp as unknown as { error?: unknown }).error),
    });
    return { ok: true, id: resp.data?.id };
  } catch (e) {
    console.error("[email] Error enviando correo genérico", e);
    return { ok: false, error: (e as Error).message };
  }
}

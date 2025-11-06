import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { sendGenericEmail } from "@/src/lib/notifications/email";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  type Body = { to?: string; subject?: string; html?: string };
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const to = body.to || user.email || undefined;
  const { subject, html } = body;
  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Campos requeridos: to, subject, html" },
      { status: 400 }
    );
  }

  const result = await sendGenericEmail({ to, subject, html });
  if ("ok" in result && result.ok) {
    return NextResponse.json({ id: result.id }, { status: 200 });
  }
  if ("skipped" in result) {
    return NextResponse.json(
      { skipped: true, reason: result.reason },
      { status: 200 }
    );
  }
  return NextResponse.json(
    { error: ("error" in result && result.error) || "Error enviando correo" },
    { status: 500 }
  );
}

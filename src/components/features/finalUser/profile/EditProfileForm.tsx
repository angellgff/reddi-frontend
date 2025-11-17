"use client";

import { useState } from "react";
import { updateUserProfile } from "@/src/lib/finalUser/profile/actions";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import UserIcon from "@/src/components/icons/UserIcon";

export default function EditProfileForm({
  initial,
  onCancel,
}: {
  initial: {
    full_name: string;
    email: string;
    phone: string;
    birthdate?: string;
  };
  onCancel?: () => void;
}) {
  const [fullName, setFullName] = useState(initial.full_name || "");
  const [email, setEmail] = useState(initial.email || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [birth, setBirth] = useState(initial.birthdate || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Split full name to first/last (simple heuristic)
    const parts = fullName.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";

    const fd = new FormData();
    fd.set("first_name", first_name);
    fd.set("last_name", last_name);
    fd.set("phone_number", phone);
    fd.set("email", email);
    // birth not persisted (no column). Left as UI-only.

    const res = await updateUserProfile(fd);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || "No se pudo actualizar");
      return;
    }
    // Back to profile page
    window.location.href = "/user/profile";
  }

  return (
    <section className="mb-6 md:mb-8">
      <Card className="border-gray-200 rounded-2xl">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-primary" />
              <h2 className="text-emerald-600 font-semibold text-lg">
                Datos Personales
              </h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-neutral-600">
                    Nombre completo
                  </Label>
                  <Input
                    placeholder="Ingresa tu nombre"
                    className="rounded-xl h-10 border-gray-300"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-neutral-600">
                    Correo electrónico
                  </Label>
                  <Input
                    type="email"
                    placeholder="correo@correo.com"
                    className="rounded-xl h-10 border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-neutral-600">Teléfono</Label>
                  <Input
                    placeholder="Número de teléfono"
                    className="rounded-xl h-10 border-gray-300"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-neutral-600">
                    Fecha de nacimiento
                  </Label>
                  <Input
                    placeholder="dd/mm/aaaa"
                    className="rounded-xl h-10 border-gray-300"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-emerald-600 rounded-xl h-11 sm:w-auto"
                >
                  {submitting ? "Guardando…" : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onCancel ? onCancel() : window.history.back()
                  }
                  className="rounded-xl h-11 sm:w-auto border-neutral-800 text-neutral-900"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

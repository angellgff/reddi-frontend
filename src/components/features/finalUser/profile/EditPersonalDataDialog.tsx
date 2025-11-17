"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { updateUserProfile } from "@/src/lib/finalUser/profile/actions";

export default function EditPersonalDataDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactNode;
  initial: { first_name: string; last_name: string; phone_number: string };
}) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState(initial.first_name);
  const [last, setLast] = useState(initial.last_name);
  const [phone, setPhone] = useState(initial.phone_number);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await updateUserProfile(fd);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "No se pudo actualizar");
      return;
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar datos personales</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                name="first_name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                name="last_name"
                value={last}
                onChange={(e) => setLast(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Teléfono</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

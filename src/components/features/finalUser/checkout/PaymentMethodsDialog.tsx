"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createClient } from "@/src/lib/supabase/client";
import {
  addUserPaymentMethod,
  deleteUserPaymentMethod,
  setDefaultPaymentMethod,
  type UserPaymentMethod,
} from "@/src/lib/finalUser/payments/actions";
import Image from "next/image";

function CardBadge({ brand }: { brand: string }) {
  const b = (brand || "").toLowerCase();
  const iconSrc =
    b === "visa"
      ? "/visa.svg"
      : b === "mastercard"
      ? "/mastercard.svg"
      : b === "amex"
      ? "/amex.svg"
      : null;
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize">
      {iconSrc ? (
        <Image src={iconSrc} alt={b} width={20} height={12} />
      ) : (
        <span className="inline-block h-3 w-3 rounded-full bg-gray-300" />
      )}
      {b || "card"}
    </span>
  );
}

export function PaymentMethodsDialog({
  trigger,
  onSelected,
}: {
  trigger: React.ReactNode;
  onSelected?: (method: UserPaymentMethod | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [methods, setMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setMethods([]);
        return;
      }
      const { data, error } = await supabase
        .from("user_payment_methods")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMethods((data as any) || []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los métodos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const defaultMethod = useMemo(
    () => methods.find((m) => m.is_default) || null,
    [methods]
  );

  // Auto-notify the parent about default method when opening
  useEffect(() => {
    if (!open) return;
    if (defaultMethod) onSelected?.(defaultMethod);
    // Only when open and default is present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultMethod]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar método de pago</DialogTitle>
        </DialogHeader>

        {/* Add form toggle */}
        {adding ? (
          <AddCardForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              load();
            }}
          />
        ) : (
          <>
            <button
              className="w-full text-left border rounded-xl px-3 py-2 text-sm mb-3"
              onClick={() => setAdding(true)}
            >
              Agregar tarjeta de crédito o débito
            </button>
            {loading ? (
              <div className="text-sm text-gray-500">Cargando…</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : methods.length === 0 ? (
              <div className="text-sm text-gray-500">
                No tienes métodos guardados.
              </div>
            ) : (
              <div className="space-y-2">
                {methods.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <CardBadge brand={m.brand} />
                      <div className="text-sm">
                        <div className="font-medium capitalize">
                          {m.brand} ·•••{m.last4}
                        </div>
                        <div className="text-xs text-gray-500">
                          {m.cardholder_name || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.is_default ? (
                        <button
                          className="text-xs underline"
                          onClick={async () => {
                            await setDefaultPaymentMethod(m.id);
                            load();
                          }}
                        >
                          Hacer predeterminada
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700">
                          Predeterminada
                        </span>
                      )}
                      <button
                        className="text-xs text-red-600 underline"
                        onClick={async () => {
                          await deleteUserPaymentMethod(m.id);
                          load();
                        }}
                      >
                        Eliminar
                      </button>
                      <DialogClose asChild>
                        <button
                          className="ml-2 h-8 rounded-lg border px-3 text-xs"
                          onClick={() => onSelected?.(m)}
                        >
                          Usar
                        </button>
                      </DialogClose>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddCardForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // controlled inputs for masking
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [exp, setExp] = useState("");
  const [postal, setPostal] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    const res = await addUserPaymentMethod(fd);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Preview card placeholder */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="text-sm">Credit</div>
        <div className="mt-2 text-lg tracking-widest">Zayn Malik</div>
        <div className="text-sm">5142 · 8164 · 6526 · 2563</div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cardholder_name">Nombre de la tarjeta</Label>
        <Input
          id="cardholder_name"
          name="cardholder_name"
          placeholder="Ingresar la información"
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="card_number">Número de tarjeta</Label>
        <Input
          id="card_number"
          name="card_number"
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          value={number}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, 19);
            const groups = raw.match(/.{1,4}/g) || [];
            setNumber(groups.join(" "));
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            name="cvv"
            placeholder="CVV"
            inputMode="numeric"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
        </div>
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="exp">Fecha de vencimiento</Label>
          <Input
            id="exp"
            name="exp"
            placeholder="mm/aaaa"
            value={exp}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
              const mm = digits.slice(0, 2);
              const yyyy = digits.slice(2);
              const mNum = Math.max(
                1,
                Math.min(12, parseInt(mm || "0", 10) || 0)
              )
                .toString()
                .padStart(2, "0");
              setExp(yyyy ? `${mNum}/${yyyy}` : mNum);
            }}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="postal_code">Código postal</Label>
        <Input
          id="postal_code"
          name="postal_code"
          placeholder="Ingresar la información"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
        />
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default PaymentMethodsDialog;

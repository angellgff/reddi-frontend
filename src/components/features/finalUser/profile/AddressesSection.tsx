"use client";

import { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "@/src/lib/finalUser/addresses/actions";
import VillageIcon from "@/src/components/icons/VillageIcon";
import BoatIcon from "@/src/components/icons/BoatIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

export type Address = {
  id: string;
  location_type: "villa" | "yate";
  location_number: string;
};

export default function AddressesSection({
  initialAddresses,
  selectedAddressId,
}: {
  initialAddresses: Address[];
  selectedAddressId: string | null;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses || []);

  function Icon({ type }: { type: Address["location_type"] }) {
    return type === "yate" ? (
      <BoatIcon className="h-5 w-5 text-primary" />
    ) : (
      <VillageIcon className="h-5 w-5 text-primary" />
    );
  }

  const reloadAfter = async (fn: () => Promise<any>) => {
    await fn();
    // naive reload: simplest re-fetch using supabase client avoided for now, mutate locally
    // In real app we'd refetch; here we approximate by removing/adding from state in-place
  };

  return (
    <Card className="border-gray-200 rounded-2xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.74962 9.33333C9.68147 9.33333 10.5924 9.05964 11.3672 8.54686C12.142 8.03408 12.7459 7.30525 13.1025 6.45252C13.4591 5.5998 13.5524 4.66149 13.3706 3.75625C13.1888 2.851 12.7401 2.01948 12.0812 1.36684C11.4223 0.714192 10.5827 0.269735 9.66879 0.0896708C8.75484 -0.0903936 7.80751 0.00202199 6.94659 0.355231C6.08567 0.70844 5.34983 1.30658 4.83212 2.07401C4.31441 2.84144 4.03809 3.74369 4.03809 4.66667C4.03809 5.90435 4.53448 7.09133 5.41806 7.9665C6.30164 8.84167 7.50004 9.33333 8.74962 9.33333ZM8.74962 1.33334C9.41522 1.33334 10.0659 1.52883 10.6193 1.8951C11.1728 2.26137 11.6041 2.78197 11.8588 3.39106C12.1135 4.00014 12.1802 4.67037 12.0503 5.31697C11.9205 5.96357 11.6 6.55752 11.1293 7.02369C10.6586 7.48987 10.059 7.80734 9.40617 7.93595C8.75335 8.06457 8.07668 7.99856 7.46174 7.74627C6.8468 7.49397 6.3212 7.06673 5.95141 6.51857C5.58161 5.97041 5.38424 5.32594 5.38424 4.66667C5.38424 3.78261 5.7388 2.93477 6.36993 2.30965C7.00106 1.68452 7.85706 1.33334 8.74962 1.33334Z"
                  fill="#04BD88"
                />
                <path
                  d="M17.1432 14.2467C16.0638 13.1167 14.7631 12.2166 13.3205 11.6015C11.878 10.9863 10.3239 10.6691 8.75335 10.6691C7.18279 10.6691 5.62872 10.9863 4.18617 11.6015C2.74361 12.2166 1.44287 13.1167 0.363462 14.2467C0.129442 14.4942 -0.000529651 14.8208 1.62232e-06 15.16V18.6667C1.62232e-06 19.0203 0.141828 19.3594 0.39428 19.6095C0.646732 19.8595 0.989131 20 1.34615 20H16.1538C16.5108 20 16.8532 19.8595 17.1057 19.6095C17.3581 19.3594 17.5 19.0203 17.5 18.6667V15.16C17.5023 14.8217 17.3748 14.4953 17.1432 14.2467ZM16.1538 18.6667H1.34615V15.1533C2.30005 14.1584 3.44836 13.3662 4.72119 12.8248C5.99403 12.2835 7.36476 12.0043 8.74998 12.0043C10.1352 12.0043 11.5059 12.2835 12.7788 12.8248C14.0516 13.3662 15.1999 14.1584 16.1538 15.1533V18.6667Z"
                  fill="#04BD88"
                />
              </svg>

              <h2 className="text-emerald-600 font-semibold text-lg">
                Direcciones Guardadas
              </h2>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-emerald-600 rounded-xl h-10">
                  Agregar dirección
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva dirección</DialogTitle>
                </DialogHeader>
                <AddOrEditAddressForm
                  onCancel={() => setAddOpen(false)}
                  onSaved={() => {
                    setAddOpen(false);
                    // optimistic append? Keep list simple
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-sm text-neutral-500">
                Aún no tienes direcciones guardadas.
              </div>
            ) : (
              addresses.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100">
                      <Icon type={a.location_type} />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Muelle 03, 93</div>
                      <div className="text-xs text-neutral-500 capitalize">
                        {a.location_type} {a.location_number}
                      </div>
                    </div>
                  </div>
                  <EditAddressInline id={a.id} current={a} />
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddOrEditAddressForm({
  onCancel,
  onSaved,
  id,
  current,
}: {
  onCancel: () => void;
  onSaved: () => void;
  id?: string;
  current?: Address;
}) {
  const [locationType, setLocationType] = useState<Address["location_type"]>(
    current?.location_type || "villa"
  );
  const [locationNumber, setLocationNumber] = useState(
    current?.location_number || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const fd = new FormData();
        fd.set("location_type", locationType);
        fd.set("location_number", locationNumber);
        const res = id
          ? await updateUserAddress(id, fd)
          : await createUserAddress(fd);
        setLoading(false);
        if (!res.success) {
          setError(res.error || "No se pudo guardar");
          return;
        }
        onSaved();
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Tipo de lugar</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLocationType("villa")}
              className={`h-9 rounded-lg border px-3 text-sm ${
                locationType === "villa"
                  ? "border-emerald-500 text-emerald-600"
                  : ""
              }`}
            >
              Villa
            </button>
            <button
              type="button"
              onClick={() => setLocationType("yate")}
              className={`h-9 rounded-lg border px-3 text-sm ${
                locationType === "yate"
                  ? "border-emerald-500 text-emerald-600"
                  : ""
              }`}
            >
              Yate
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Número</Label>
          <Input
            value={locationNumber}
            onChange={(e) => setLocationNumber(e.target.value)}
            placeholder="#12, 34, etc."
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function EditAddressInline({ id, current }: { id: string; current: Address }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-8 rounded-lg border px-3 text-xs">Editar</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar dirección</DialogTitle>
        </DialogHeader>
        <AddOrEditAddressForm
          onCancel={() => setOpen(false)}
          onSaved={() => setOpen(false)}
          id={id}
          current={current}
        />
      </DialogContent>
    </Dialog>
  );
}

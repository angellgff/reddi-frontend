"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import PaymentMethodsDialog from "@/src/components/features/finalUser/checkout/PaymentMethodsDialog";
import { createClient } from "@/src/lib/supabase/client";
import {
  deleteUserPaymentMethod,
  setDefaultPaymentMethod,
  type UserPaymentMethod,
} from "@/src/lib/finalUser/payments/actions";
import Image from "next/image";

function BrandBadge({ brand }: { brand: string }) {
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

export default function PaymentMethodsSection({
  initialMethods,
}: {
  initialMethods: UserPaymentMethod[];
}) {
  const [methods, setMethods] = useState<UserPaymentMethod[]>(initialMethods);

  async function reload() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMethods([]);
    const { data } = await supabase
      .from("user_payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMethods((data as any) || []);
  }

  useEffect(() => {
    // keep in sync if server loaded list is empty and user adds
  }, []);

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
                Métodos de Pago
              </h2>
            </div>
            <PaymentMethodsDialog
              onSelected={() => reload()}
              trigger={
                <Button className="bg-primary hover:bg-emerald-600 rounded-xl h-10">
                  Agregar método
                </Button>
              }
            />
          </div>

          <div className="space-y-3">
            {methods.length === 0 ? (
              <div className="text-sm text-neutral-500">
                Aún no tienes métodos de pago guardados.
              </div>
            ) : (
              methods.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <BrandBadge brand={m.brand} />
                    <div className="text-sm">
                      <div className="font-medium capitalize">
                        {m.brand} terminada en {m.last4}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Expira {String(m.exp_month).padStart(2, "0")}/
                        {m.exp_year}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {m.is_default ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs px-3 py-1">
                        Principal
                      </span>
                    ) : (
                      <button
                        className="text-xs underline"
                        onClick={async () => {
                          await setDefaultPaymentMethod(m.id);
                          reload();
                        }}
                      >
                        Hacer principal
                      </button>
                    )}
                    <button
                      className="text-xs text-red-600 underline"
                      onClick={async () => {
                        await deleteUserPaymentMethod(m.id);
                        reload();
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

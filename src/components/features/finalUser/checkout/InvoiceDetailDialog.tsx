"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

interface InvoiceItem {
  productId: string;
  partnerId: string;
  name?: string;
  unitPrice: number;
  quantity: number;
  note?: string | null;
  extras: Array<{
    extraId: string;
    name?: string;
    quantity: number;
    price: number;
  }>;
}

interface InvoiceAddress {
  location_type?: string;
  location_number?: string;
  street?: string;
  city?: string;
  province?: string;
}

interface InvoicePayment {
  brand?: string | null;
  last4?: string | null;
}

interface InvoiceSchedule {
  mode: "now" | "later";
  date?: string;
  time?: string;
}

interface InvoiceCoupon {
  code?: string;
  discount_type?: string;
  discount_value?: number;
}

interface InvoiceDetailDialogProps {
  trigger: React.ReactNode;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  serviceFee: number;
  tip: number;
  total: number;
  address?: InvoiceAddress | null;
  payment?: InvoicePayment | null;
  schedule?: InvoiceSchedule;
  coupon?: InvoiceCoupon | null;
  customerName?: string;
  customerPhone?: string;
}

function currency(n: number) {
  if (!isFinite(n)) return "RD$0.00";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(n);
}

export function InvoiceDetailDialog({
  trigger,
  items,
  subtotal,
  discount,
  shipping,
  serviceFee,
  tip,
  total,
  address,
  payment,
  schedule,
  coupon,
  customerName,
  customerPhone,
}: InvoiceDetailDialogProps) {
  const today = new Date();
  const invoiceDate = today.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const invoiceNumber = `INV-${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(
    today.getHours()
  ).padStart(2, "0")}${String(today.getMinutes()).padStart(2, "0")}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalle de Recibo</DialogTitle>
        </DialogHeader>

        {/* Invoice Content */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="border-b-2 border-gray-900 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RECIBO</h1>
                <p className="mt-1 text-sm text-gray-600">
                  No. {invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Fecha</p>
                <p className="text-sm text-gray-600">{invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* Company & Client Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">
                De
              </h3>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Reddi</p>
                <p>Plataforma de Delivery</p>
                <p>República Dominicana</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">
                Para
              </h3>
              <div className="text-sm text-gray-700">
                {customerName && (
                  <p className="font-medium">{customerName}</p>
                )}
                {customerPhone && (
                  <p className="text-gray-600">{customerPhone}</p>
                )}
                {address ? (
                  <>
                    <p className="capitalize mt-2">
                      {address.location_type || "Cliente"}
                      {address.location_number
                        ? ` #${address.location_number}`
                        : ""}
                    </p>
                    {address.street && <p>{address.street}</p>}
                    {address.city && <p>{address.city}</p>}
                    {address.province && <p>{address.province}</p>}
                  </>
                ) : (
                  <p>Dirección no especificada</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">
              Detalle de Productos
            </h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">
                      Cant.
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">
                      P. Unit.
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, idx) => {
                    const itemTotal = item.unitPrice * item.quantity;
                    const extrasTotal = item.extras.reduce(
                      (sum, extra) => sum + extra.price * extra.quantity,
                      0
                    );
                    const lineTotal = itemTotal + extrasTotal;

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name || `Producto ${idx + 1}`}
                            </p>
                            {item.note && (
                              <p className="text-xs text-gray-500 mt-1">
                                Nota: {item.note}
                              </p>
                            )}
                            {item.extras.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.extras.map((extra, extraIdx) => (
                                  <p
                                    key={extraIdx}
                                    className="text-xs text-gray-600"
                                  >
                                    + {extra.name || "Extra"} (x
                                    {extra.quantity}) - {currency(extra.price)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {currency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {currency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  {currency(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Descuento{coupon?.code ? ` (${coupon.code})` : ""}:
                  </span>
                  <span className="font-medium text-emerald-600">
                    -{currency(discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium text-gray-900">
                  {currency(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cargo por servicio:</span>
                <span className="font-medium text-gray-900">
                  {currency(serviceFee)}
                </span>
              </div>

              {tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Propina:</span>
                  <span className="font-medium text-gray-900">
                    {currency(tip)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-gray-900 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    TOTAL:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {currency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">
                Método de Pago
              </h3>
              <div className="text-sm text-gray-700">
                {payment ? (
                  <>
                    <p className="capitalize">
                      {payment.brand || "Tarjeta"}{" "}
                      {payment.last4 ? `•••• ${payment.last4}` : ""}
                    </p>
                  </>
                ) : (
                  <p>No especificado</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">
                Entrega
              </h3>
              <div className="text-sm text-gray-700">
                {schedule ? (
                  <>
                    {schedule.mode === "now" ? (
                      <p>Entrega inmediata</p>
                    ) : (
                      <>
                        <p>Programada</p>
                        {schedule.date && schedule.time && (
                          <p className="text-xs text-gray-600 mt-1">
                            {schedule.date} a las {schedule.time}
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p>No especificada</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Gracias por tu preferencia. Este documento es un comprobante de
              tu pedido.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer?: string;
}

const faqs: FaqItem[] = [
  { question: "¿Cuándo recibo mis pagos?" },
  { question: "¿Cómo edito un producto del menú?" },
  { question: "¿Qué pasa si un pedido es cancelado?" },
  { question: "¿Cómo cambio mi horario de atención?" },
  { question: "¿Cómo actualizo mis datos de contacto?" },
];

export default function SupportContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] px-6 py-6">
      <div className="mx-auto w-full">
        <section className="rounded-2xl bg-white p-5">
          <h2 className="mb-[15px] text-[18px] font-semibold leading-[22px] text-black">
            Preguntas Frecuentes
          </h2>

          <div className="overflow-hidden rounded-[16px] border border-[#D9DCE3]">
            {faqs.map((item, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={item.question}
                  className={`border-b border-[#D9DCE3] last:border-b-0`}
                >
                  <button
                    type="button"
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-4 py-4 text-left"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    aria-expanded={open}
                  >
                    <span className="text-[16px] font-medium leading-5 text-black">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#9BA1AE] transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Optional answer block - hidden for now but structure ready */}
                  {open && item.answer && (
                    <div className="px-4 pb-4 text-sm text-[#6A6C71]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex h-[31px] items-center justify-center border-t border-[#D9DCE3]">
              <button
                type="button"
                className="w-full text-center text-[14px] leading-[17px] text-[#6A6C71]"
              >
                Ver más preguntas
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

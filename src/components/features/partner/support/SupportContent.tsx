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
    <div className="min-h-screen w-full bg-[#F0F2F5B8] px-6 py-6">
      <div className="mx-auto max-w-[1117px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] leading-[28px] font-semibold text-[#171717]">
            Soporte y Ayuda
          </h1>
          <p className="mt-1 text-[18px] leading-6 text-[#000] font-roboto">
            Encuentra respuestas rápidas o contáctanos
          </p>
        </div>

        {/* FAQ card */}
        <section className="rounded-[20px] bg-white p-5 shadow-sm border border-[#E7E7E7]/0">
          <h2 className="mb-4 text-[18px] leading-[22px] font-semibold text-[#04BD88]">
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
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    aria-expanded={open}
                  >
                    <span className="text-[16px] leading-5 font-medium text-black">
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

            {/* Ver más preguntas */}
            <div className="flex items-center justify-center border-t border-[#D9DCE3]">
              <button
                type="button"
                className="w-full py-2 text-center text-[14px] leading-[17px] text-[#6A6C71]"
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

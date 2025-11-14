import Image from "next/image";
import CheckIcon from "@/src/components/icons/CheckIcon";

const benefits = [
  {
    title: "Entregas puntuales al minuto",
    desc: "Cumplimos con los horarios acordados para que nunca tengas que esperar",
  },
  {
    title: "Productos frescos y de calidad",
    desc: "Seleccionamos cuidadosamente cada producto para garantizar la máxima calidad",
  },
  {
    title: "Comercios aliados de confianza",
    desc: "Trabajamos solo con los mejores establecimientos de la zona",
  },
  {
    title: "Pago seguro y rápido",
    desc: "Múltiples métodos de pago con la máxima seguridad en cada transacción",
  },
];

export default function BenefitsSection() {
  return (
    <div className="w-full bg-[#F9FAFB] py-12 md:py-16 flex flex-col lg:flex-row items-center gap-10 md:gap-14">
      {/* Imagen */}
      <div className="w-full lg:w-[570px] flex-shrink-0 max-w-full">
        <Image
          src="/enjoy-free.jpg"
          alt="Persona disfrutando mientras espera su pedido"
          width={570}
          height={488}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 570px"
          className="rounded-xl object-cover w-full h-[260px] sm:h-[320px] md:h-[420px] lg:h-[488px] max-w-full"
          priority
        />
      </div>
      {/* Lista de beneficios */}
      <div className="flex flex-col gap-8 max-w-xl lg:max-w-[594px] w-full">
        <h2 className="font-bold text-2xl sm:text-3xl text-[#111827] leading-tight">
          Beneficios de <span className="text-[#00C48C]">Reddi</span>
        </h2>
        <div className="flex flex-col gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="flex items-center justify-center bg-[#00C48C] rounded-full w-8 h-8 mt-1">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="font-semibold text-base sm:text-lg md:text-xl text-black leading-tight">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-snug">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

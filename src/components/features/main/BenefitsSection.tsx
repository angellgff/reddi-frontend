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
    <section className="w-full flex flex-col lg:flex-row items-center gap-10 md:gap-12 px-6 md:px-20 py-12 md:py-14">
      <div className="w-full lg:w-auto max-w-md lg:max-w-none">
        <Image
          src="/girl.png"
          alt="Persona disfrutando mientras espera su pedido"
          width={570}
          height={488}
          className="rounded-xl object-cover w-full h-auto"
          priority
        />
      </div>
      <div className="flex flex-col gap-10 max-w-xl lg:max-w-[594px] w-full">
        <h2 className="font-bold text-2xl md:text-3xl text-[#111827]">
          Beneficios de <span className="text-[#00C48C]">Reddi</span>
        </h2>
        <div className="flex flex-col gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="flex items-center justify-center bg-[#00C48C] rounded-full w-7 h-7 mt-1">
                <CheckIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="font-semibold text-lg md:text-xl text-black leading-tight">
                  {b.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-snug">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

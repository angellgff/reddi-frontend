import SearchIcon from "@/src/components/icons/SearchIcon";
import ClockIcon from "@/src/components/icons/ClockIcon";
import AnchorIcon from "@/src/components/icons/AnchorIcon";

// Static presentational server component
export default function HowItWorksSection() {
  const steps = [
    {
      icon: <SearchIcon className="w-8 h-8 text-[#00C48C]" />,
      title: "Elige lo que necesitas",
      desc: "Navega por nuestras categorías y selecciona los productos que deseas",
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-[#00C48C]" />,
      title: "Programa la entrega exacta",
      desc: "Selecciona la hora y ubicación exacta donde quieres recibir tu pedido",
    },
    {
      icon: <AnchorIcon className="w-8 h-8 text-[#00C48C]" />,
      title: "Recíbelo en tu villa o yate",
      desc: "Nuestro equipo te entrega todo directamente donde te encuentres",
    },
  ];

  return (
    <section className="w-full bg-white px-6 md:px-12 py-8 md:py-10 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-bold text-2xl md:text-3xl text-[#111827]">
          Cómo funciona
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl">
          Tres simples pasos para recibir todo lo que necesitas
        </p>
      </div>
      <div className="grid gap-6 md:gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.title}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow-[0_16px_32px_-4px_rgba(12,12,13,0.1),0_4px_4px_-4px_rgba(12,12,13,0.05)] px-6 py-6 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#222222] mb-4 text-white">
              {s.icon}
            </div>
            <h3 className="font-semibold text-lg md:text-xl mb-2 text-black">
              {s.title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-snug">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

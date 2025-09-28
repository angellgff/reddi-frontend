import Image from "next/image";

interface Step1CardProps {
  id: string;
  name: string;
  label: string;
  value: string;
  imageUrl: string;
  actualValue: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step1Card({
  id,
  name,
  label,
  value,
  imageUrl,
  actualValue,
  onChange,
}: Step1CardProps) {
  return (
    <label htmlFor={id}>
      <input
        type="checkbox"
        className="peer sr-only"
        id={id}
        value={value}
        name={name}
        onChange={onChange}
      />
      <div
        className={`flex flex-col items-center justify-center sm:h-28 sm:w-28 lg:h-36 lg:w-36 xl:h-44 xl:w-44 bg-[#F0F2F5B8] shadow-md cursor-pointer rounded-2xl hover:border-2 hover:border-primary transition-colors duration-500 ${
          actualValue === value
            ? "border-2 border-primary"
            : "border-transparent"
        }`}
      >
        <div className="relative w-24 h-24">
          <Image
            src={imageUrl}
            alt={`Icono de ${name}`}
            fill={true}
            className="object-fit"
          />
        </div>
        <span className="font-medium text-sm md:text-lg">{label}</span>
      </div>
    </label>
  );
}

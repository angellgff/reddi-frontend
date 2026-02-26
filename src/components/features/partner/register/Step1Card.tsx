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
        type="radio"
        className="peer sr-only"
        id={id}
        value={value}
        name={name}
        onChange={onChange}
      />
      <div
        className={`flex h-[169px] w-[178px] flex-col items-center justify-center rounded-2xl border-2 bg-[#F4F5F7] p-5 transition-colors duration-200 ${
          actualValue === value
            ? "border-primary"
            : "border-transparent hover:border-primary/50"
        }`}
      >
        <div className="relative h-[92px] w-[110px]">
          <Image
            src={imageUrl}
            alt={`Icono de ${name}`}
            fill={true}
            className="object-contain"
          />
        </div>
        <span className="mt-2 text-center text-base font-medium leading-[22px] text-black md:text-lg">
          {label}
        </span>
      </div>
    </label>
  );
}

import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";

interface OrderBasicButtonProps {
  onBack: () => void;
}

export default function OrderBasicButton({ onBack }: OrderBasicButtonProps) {
  return (
    <button
      className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition-colors"
      onClick={onBack}
    >
      <ArrowLeftIcon />
    </button>
  );
}

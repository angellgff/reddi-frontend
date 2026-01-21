interface PartnerSubmitButtonProps {
  isPending: boolean;
  label?: string;
  loadingLabel?: string;
}

export default function PartnerSubmitButton({
  isPending,
  label = "Continuar",
  loadingLabel = "Iniciando...",
}: PartnerSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full h-[50px] bg-[#04BD88] hover:bg-[#03a373] text-white font-bold text-xl rounded-[18px] transition-colors flex justify-center items-center mt-4 shadow-lg shadow-[#04BD88]/20"
      style={{ fontFamily: "Open Sans, sans-serif" }}
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}

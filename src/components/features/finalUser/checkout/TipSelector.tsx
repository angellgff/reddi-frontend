"use client";

export default function TipSelector({
  value,
  onChange,
  options = [3, 6, 9, 12, 15],
}: {
  value: number;
  onChange: (next: number) => void;
  options?: number[];
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-10 rounded-xl border text-sm ${
            value === p
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-white hover:bg-gray-50"
          }`}
          type="button"
        >
          {p}%
        </button>
      ))}
    </div>
  );
}

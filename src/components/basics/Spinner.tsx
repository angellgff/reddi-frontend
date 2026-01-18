export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`
       w-12 h-12 
       border-4 border-solid border-gray-200 
       border-t-emerald-500 
       rounded-full 
       animate-spin
       ${className}
     `}
      role="status"
    >
      <span className="sr-only"></span>
    </div>
  );
}

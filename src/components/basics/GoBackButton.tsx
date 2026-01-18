import Link from "next/link";

export default function GoBackButton() {
  return (
    <Link
      href="/"
      className="text-primary hover:text-primary/80 hover:underline font-medium inline-flex items-center"
    >
      <span className="mr-1">&larr;</span> Volver
    </Link>
  );
}

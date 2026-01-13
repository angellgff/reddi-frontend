"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function MobileSearchBar({
  placeholder = "Busca en El Nacional",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push("?" + params.toString());
  };

  return (
    <form onSubmit={handleSubmit} className="md:hidden w-full mb-6">
      <div className="relative bg-gray-100 rounded-xl flex items-center px-4 py-3 gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent w-full text-sm outline-none placeholder:text-gray-400 text-black"
        />
      </div>
    </form>
  );
}

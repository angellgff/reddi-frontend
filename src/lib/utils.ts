import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomNumberFrom1To10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// Generate a UUID v4 in environments where crypto.randomUUID may not exist (browser/Turbopack)
export function uuid(): string {
  const g: any = globalThis as any;
  const c = g?.crypto;
  // Prefer native when available
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback using getRandomValues if present
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    // RFC4122 version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    const b = Array.from(bytes, toHex).join("");
    return (
      b.substring(0, 8) +
      "-" +
      b.substring(8, 12) +
      "-" +
      b.substring(12, 16) +
      "-" +
      b.substring(16, 20) +
      "-" +
      b.substring(20)
    );
  }
  // Last-resort fallback (not cryptographically strong)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

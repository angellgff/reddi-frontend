import type { NextConfig } from "next";

// Dynamically include the Supabase storage hostname so next/image accepts remote images
// The runtime error showed a domain like: vnihjvkhykwbnnsdfwbo.supabase.co
// We derive it from NEXT_PUBLIC_SUPABASE_URL when possible to avoid hardcoding.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // ignore parse errors; we'll fall back below
  }
}

// Fallback: include the specific hostname observed in the error if it's not already included.
const fallbackHost = "vnihjvkhykwbnnsdfwbo.supabase.co";
if (!remotePatterns.some((p) => p.hostname === fallbackHost)) {
  remotePatterns.push({
    protocol: "https",
    hostname: fallbackHost,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

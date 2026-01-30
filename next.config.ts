import { withSentryConfig } from "@sentry/nextjs";
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
  output: "standalone",
  images: {
    remotePatterns: [
      ...remotePatterns,
      // Allow Google avatars (e.g., OAuth profiles)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/registro",
        destination: "/auth/registro",
        permanent: true,
      },
    ];
  },
};


const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

export default withSentryConfig(withPWA(nextConfig), {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "zagon-tech",

 project: "javascript-nextjs",

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 tunnelRoute: "/monitoring",

 webpack: {
   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
   // See the following for more information:
   // https://docs.sentry.io/product/crons/
   // https://vercel.com/docs/cron-jobs
   automaticVercelMonitors: true,

   // Tree-shaking options for reducing bundle size
   treeshake: {
     // Automatically tree-shake Sentry logger statements to reduce bundle size
     removeDebugLogging: true,
   },
 }
});

import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@seoforge/core", "@seoforge/seo-geo", "@seoforge/agent-runtime", "@seoforge/integrations"],
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com; frame-src 'self' https://*.vercel.app https://vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com" },
    ],
  }],
};

export default config;

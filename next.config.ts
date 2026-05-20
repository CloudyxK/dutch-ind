import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer info sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year (Vercel always HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Disable unnecessary browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()",
  },
  // DNS prefetch control
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy
  // Midtrans Snap needs scripts + frames from *.midtrans.com
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.midtrans.com https://*.neon.tech",
      "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide Next.js version from response headers
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.midtrans.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "dutch-indd.vercel.app",
        // catch any *.vercel.app preview URLs
        ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
      ],
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

export default nextConfig;

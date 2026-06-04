import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com https://www.googletagmanager.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.midtrans.com https://*.neon.tech https://www.google-analytics.com https://api.brevo.com",
      "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.midtrans.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Serve modern formats (WebP/AVIF) — reduces image payload 30-50%
    formats: ["image/avif", "image/webp"],
    // Minimize layout shift with blur placeholder
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // cache optimized images for 1 hour
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "dutch-indd.vercel.app",
        ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
      ],
    },
    // Optimize package imports — reduces JS bundle for heavy libraries
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "swiper"],
  },

  async headers() {
    return [
      // Security headers on all routes
      { source: "/(.*)", headers: securityHeaders },
      // Long-cache for built static assets (hashed filenames)
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Cache public images/icons for 24h
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" }],
      },
      // Service worker — no cache so updates propagate immediately
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

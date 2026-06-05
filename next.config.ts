import type { NextConfig } from "next";

// ─── Security Headers ─────────────────────────────────────────────────────────
// Applied to every response via headers() config.
// The middleware also injects HSTS + CORP/COOP per-request.

const TRUSTED_DOMAINS = [
  "https://app.midtrans.com",
  "https://app.sandbox.midtrans.com",
  "https://www.googletagmanager.com",
  "https://connect.facebook.net",
  "https://res.cloudinary.com",
];

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options",           value: "DENY" },
  // Prevent MIME sniffing (drive-by download prevention)
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Limit referrer info
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year + preload
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disable unneeded browser APIs
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()" },
  // Enable DNS prefetch for performance without leaking referer
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  // Prevent cross-origin resource sharing by default
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Prevent window opener attacks (tab-napping)
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin-allow-popups" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      // Default: only same-origin
      "default-src 'self'",
      // Scripts: self + Midtrans Snap + GA + Meta Pixel
      // 'unsafe-inline' needed for Next.js inline scripts (hydration) — acceptable trade-off
      `script-src 'self' 'unsafe-inline' ${TRUSTED_DOMAINS.slice(0, 4).join(" ")}`,
      // Styles: inline required for Tailwind CSS
      "style-src 'self' 'unsafe-inline'",
      // Images: allow data URIs (blurred placeholders) + all HTTPS (product images from CDNs)
      "img-src 'self' data: blob: https:",
      // Fonts: self only
      "font-src 'self'",
      // Fetch/XHR: self + essential APIs
      "connect-src 'self' https://*.midtrans.com https://*.neon.tech https://www.google-analytics.com https://api.brevo.com https://raja-ongkir.vercel.app",
      // Iframes: Midtrans payment + YouTube embeds
      "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com https://www.youtube.com",
      // Block <object>, <embed>, <applet>
      "object-src 'none'",
      // Restrict <base> tag
      "base-uri 'self'",
      // Forms can only submit to same origin
      "form-action 'self'",
      // Workers (service worker)
      "worker-src 'self'",
      // Automatically upgrade HTTP to HTTPS
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  // Remove "X-Powered-By: Next.js" — reduces information disclosure
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.midtrans.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Serve AVIF/WebP — 30-50% smaller than JPEG
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "dutch-indd.vercel.app",
        ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
      ],
    },
    // Tree-shake large packages — reduces JS bundle size
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "swiper"],
  },

  async headers() {
    return [
      // ── Security headers on ALL routes ─────────────────────────────────
      { source: "/(.*)", headers: securityHeaders },

      // ── No-cache on sensitive API routes ───────────────────────────────
      {
        source: "/api/(auth|user|profile|orders|addresses|notifications)(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",        value: "no-cache" },
        ],
      },
      // ── No-cache on admin routes ────────────────────────────────────────
      {
        source: "/api/admin(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },

      // ── Long cache for hashed static assets ────────────────────────────
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // ── Medium cache for public media ───────────────────────────────────
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|webp|avif)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" }],
      },
      // ── Service worker — must revalidate immediately ────────────────────
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

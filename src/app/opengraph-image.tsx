import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const revalidate = 86400;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#080808",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          fontFamily: "sans-serif",
        }}
      >
        {/* Grain effect via radial gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 65%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 8 }}>
            <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 12, letterSpacing: "0.5em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
              Brand Streetwear
            </span>
            <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.2)" }} />
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: "#F5F5F5",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            DUTCH.IND
          </div>
          <span style={{ fontSize: 14, letterSpacing: "0.4em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Samarinda, Indonesia · Est. 2026
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            padding: "14px 36px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Streetwear Premium · 100% Original
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}

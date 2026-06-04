import { ImageResponse } from "next/og";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 3600; // cache OG image for 1 hour

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { name: true } },
    },
  });

  const price = product?.price
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)
    : "";

  const imageUrl = product?.images[0]?.url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#080808",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left — product image */}
        {imageUrl && (
          <div style={{ display: "flex", width: 630, height: 630, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: 630, height: 630,
                background: "linear-gradient(to right, transparent 60%, #080808 100%)",
              }}
            />
          </div>
        )}

        {/* Right — text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "56px 52px",
          }}
        >
          {/* Top: brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, letterSpacing: "0.5em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
              DUTCH.IND
            </span>
            {product?.category?.name && (
              <span style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", marginTop: 4 }}>
                {product.category.name}
              </span>
            )}
          </div>

          {/* Middle: name + price */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: product?.name && product.name.length > 25 ? 46 : 56,
                fontWeight: 900,
                color: "#F5F5F5",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                lineHeight: 0.95,
              }}
            >
              {product?.name ?? "Produk DUTCH.IND"}
            </div>
            {price && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Harga</span>
                <span style={{ fontSize: 34, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em" }}>
                  {price}
                </span>
              </div>
            )}
            {product?.totalStock === 0 && (
              <div style={{ display: "flex", padding: "6px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", width: "fit-content" }}>
                <span style={{ fontSize: 11, color: "#F87171", letterSpacing: "0.3em", textTransform: "uppercase" }}>Stok Habis</span>
              </div>
            )}
          </div>

          {/* Bottom: CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                padding: "14px 28px",
                background: "#FFFFFF",
                color: "#000000",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                width: "fit-content",
              }}
            >
              Beli Sekarang →
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
              dutch-indd.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

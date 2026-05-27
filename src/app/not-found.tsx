import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "#060608" }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.055,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Ghost 404 */}
      <div
        aria-hidden
        className="absolute font-display font-black pointer-events-none"
        style={{
          fontSize: "clamp(10rem, 30vw, 22rem)",
          lineHeight: 1,
          color: "rgba(255,255,255,0.03)",
          letterSpacing: "-0.04em",
          userSelect: "none",
        }}
      >
        404
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.25)" }} />
          <span
            className="text-[9px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Error 404
          </span>
          <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.25)" }} />
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-white mb-4">
          Halaman Tidak Ditemukan
        </h1>

        <p
          className="text-sm max-w-sm leading-relaxed mb-10"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Coba kembali ke beranda atau jelajahi koleksi kami.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 text-[11px] font-black uppercase tracking-[0.22em] hover:bg-white/90 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Lihat Semua Produk →
          </Link>
        </div>
      </div>

      {/* Bottom stamp */}
      <p
        className="absolute bottom-7 text-[8px] uppercase tracking-[0.65em]"
        style={{ color: "rgba(255,255,255,0.1)" }}
      >
        DUTCH.IND &nbsp;/&nbsp; STREETWEAR
      </p>
    </div>
  );
}

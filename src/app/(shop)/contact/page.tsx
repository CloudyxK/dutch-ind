import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import RevealSection from "@/components/ui/RevealSection";

export const metadata: Metadata = {
  title: "Contact — DUTCH.IND",
};

async function getContact() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "contact.config" } });
    return row ? JSON.parse(row.value) : null;
  } catch {
    return null;
  }
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default async function ContactPage() {
  const contact = await getContact();

  const waHref = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage || "Halo DUTCH.IND, saya ingin bertanya...")}`
    : "https://wa.me/6285217733737";

  const igHref = contact?.instagram
    ? `https://instagram.com/${contact.instagram}`
    : "https://instagram.com/dutch.ind";

  const channels = [
    {
      icon: <WhatsAppIcon />,
      label: "WhatsApp",
      value: contact?.whatsapp?.replace(/^62/, "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3") || "0852-1773-3737",
      href: waHref,
      sub: contact?.operationalHours || "Senin–Sabtu, 08.00–21.00",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      label: "Instagram",
      value: contact?.instagram ? `@${contact.instagram}` : "@dutch.ind",
      href: igHref,
      sub: "Follow untuk update koleksi",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
        </svg>
      ),
      label: "TikTok",
      value: contact?.tiktok ? `@${contact.tiktok}` : "@dutch.ind",
      href: contact?.tiktok ? `https://tiktok.com/@${contact.tiktok}` : "#",
      sub: "Behind the scenes & drop alerts",
    },
  ];

  return (
    <div className="bg-[#080808] min-h-screen">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-28 border-b border-white/[0.05]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }} aria-hidden>
          <filter id="ct-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#ct-grain)" />
        </svg>

        <div className="container-main relative z-10">
          <RevealSection>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/25 mb-5">◈ &nbsp;DUTCH.IND &nbsp;◈</p>
            <h1
              className="font-display uppercase leading-none"
              style={{ fontSize: "clamp(3rem,9vw,7.5rem)" }}
            >
              <span className="text-white">GET IN</span>
              <br />
              <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.6)" }}>
                TOUCH
              </span>
            </h1>
            <p className="mt-6 text-sm text-white/30 max-w-xs leading-relaxed">
              Ada pertanyaan soal produk, pesanan, atau kolaborasi? Hubungi kami melalui salah satu kanal di bawah.
            </p>
          </RevealSection>
        </div>
      </div>

      {/* ── Contact channels ────────────────────────────────────── */}
      <div className="container-main py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/[0.06]">
          {channels.map((ch, i) => (
            <RevealSection key={ch.label} delay={i * 0.1}>
              <a
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/[0.06] last:border-0 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <div className="text-white/40 group-hover:text-white transition-colors duration-300 mb-5">
                  {ch.icon}
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/25 mb-2">{ch.label}</p>
                <p className="text-lg font-bold text-white group-hover:text-white transition-colors">{ch.value}</p>
                <p className="mt-2 text-xs text-white/30">{ch.sub}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/25 group-hover:text-white/60 transition-colors">
                  <span>Hubungi</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </a>
            </RevealSection>
          ))}
        </div>
      </div>

      {/* ── FAQ / Info strip ────────────────────────────────────── */}
      <div className="border-t border-white/[0.05]">
        <div className="container-main py-20">
          <RevealSection>
            <h2
              className="font-display uppercase text-white/10 mb-16 text-center"
              style={{ fontSize: "clamp(2rem,5vw,4rem)" }}
            >
              Info Penting
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Jam Operasional",  body: contact?.operationalHours || "Senin–Sabtu\n08.00 – 21.00 WITA" },
              { title: "Pengiriman",        body: "Kami melayani pengiriman ke seluruh Indonesia via JNE, J&T, dan ekspedisi lainnya." },
              { title: "Retur & Penukaran", body: "Produk cacat produksi dapat ditukar dalam 3×24 jam setelah diterima." },
              { title: "Metode Bayar",      body: "Transfer bank, QRIS, DANA, GoPay, OVO, dan COD untuk area Samarinda." },
            ].map((item, i) => (
              <RevealSection key={item.title} delay={i * 0.08}>
                <div className="border-t border-white/[0.07] pt-6">
                  <p className="text-[10px] uppercase tracking-[0.38em] text-white/30 mb-3">{item.title}</p>
                  <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line">{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.05]">
        <RevealSection>
          <div className="py-20 text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6">
              Siap belanja?
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-black px-12 py-4 text-[11px] font-bold uppercase tracking-[0.35em] hover:bg-brand-gray-100 transition-colors"
            >
              Lihat Koleksi
            </Link>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}

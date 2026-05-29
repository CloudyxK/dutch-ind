import Link from "next/link";
import { Instagram } from "lucide-react";
import prisma from "@/lib/prisma";
import NewsletterForm from "./NewsletterForm";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
    </svg>
  );
}

type ContactConfig = {
  whatsapp:         string;
  whatsappMessage:  string;
  instagram:        string;
  tiktok:           string;
  email:            string;
  operationalHours: string;
} | null;

async function getContactConfig(): Promise<ContactConfig> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "contact.config" } });
    if (!row) return null;
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

const footerLinks = {
  produk: [
    { href: "/products?category=hoodie",     label: "Hoodie"     },
    { href: "/products?category=t-shirt",    label: "T-Shirt"    },
    { href: "/products?category=celana",     label: "Celana"     },
    { href: "/products?category=outerwear",  label: "Outerwear"  },
    { href: "/products?category=aksesori",   label: "Aksesori"   },
  ],
  bantuan: [
    { label: "Lacak Pesanan",        href: "/track"             },
    { label: "Panduan Ukuran",       href: "/help#ukuran"       },
    { label: "Informasi Pengiriman", href: "/help#pengiriman"   },
    { label: "Pengembalian Barang",  href: "/help#pengembalian" },
    { label: "Cara Pemesanan",       href: "/help#cara-pemesanan" },
    { label: "Hubungi Kami",         href: "/contact"           },
  ],
  perusahaan: [
    { href: "/about",   label: "Tentang Kami"       },
    { href: "/privacy", label: "Kebijakan Privasi"  },
    { href: "/terms",   label: "Syarat & Ketentuan" },
  ],
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default async function Footer() {
  const contact = await getContactConfig();

  const waHref = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage || "")}`
    : "https://wa.me/6285217733737";
  const igHref = contact?.instagram
    ? `https://www.instagram.com/${contact.instagram}/`
    : "https://www.instagram.com/dutch.ind/";
  const waDisplay = contact?.whatsapp
    ? contact.whatsapp.replace(/^62/, "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3")
    : "0852-1773-3737";
  const igDisplay = contact?.instagram ? `@${contact.instagram}` : "@dutch.ind";
  const tiktokHref = contact?.tiktok
    ? `https://www.tiktok.com/@${contact.tiktok}`
    : "https://www.tiktok.com/@dutch.ind";
  const tiktokDisplay = contact?.tiktok ? `@${contact.tiktok}` : "@dutch.ind";

  return (
    <footer className="bg-brand-gray-900 border-t border-brand-gray-800">
      {/* Marquee banner */}
      <div className="border-b border-brand-gray-800 py-4 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {Array(8).fill(null).map((_, i) => (
              <span key={i} className="inline-block px-8 text-xs font-bold uppercase tracking-widest text-brand-gray-500">
                DUTCH.IND &nbsp;/&nbsp; KUALITAS PREMIUM &nbsp;/&nbsp; GAYA OTENTIK &nbsp;/&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-display tracking-widest">DUTCH.IND</Link>
            <p className="mt-4 text-sm text-brand-gray-400 leading-relaxed max-w-xs">
              Brand streetwear premium Indonesia. Kami menghadirkan desain eksklusif
              dengan kualitas terbaik untuk generasi urban yang berani tampil beda.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a href={igHref} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                 aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                 aria-label="WhatsApp">
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a href={tiktokHref} target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                 aria-label="TikTok">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Contact info */}
            <div className="mt-4 space-y-1.5">
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors">
                <WhatsAppIcon className="w-3 h-3 text-green-500" />
                <span>{waDisplay}</span>
              </a>
              <a href={igHref} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors">
                <Instagram className="w-3 h-3" />
                <span>{igDisplay}</span>
              </a>
              <a href={tiktokHref} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors">
                <TikTokIcon className="w-3 h-3" />
                <span>{tiktokDisplay}</span>
              </a>
              {contact?.email && (
                <a href={`mailto:${contact.email}`}
                   className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors">
                  <span className="text-[10px] text-brand-gray-600">✉</span>
                  <span>{contact.email}</span>
                </a>
              )}
              {contact?.operationalHours && (
                <p className="text-[10px] text-brand-gray-600 pt-1">{contact.operationalHours}</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Produk</h3>
            <ul className="space-y-2">
              {footerLinks.produk.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Bantuan</h3>
            <ul className="space-y-2">
              {footerLinks.bantuan.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-brand-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CS box */}
            <div className="mt-6 p-3 border border-brand-gray-700 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">Layanan Pelanggan</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors font-semibold">
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Chat via WhatsApp
              </a>
              {contact?.operationalHours && (
                <p className="text-[10px] text-brand-gray-600">{contact.operationalHours}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              {footerLinks.perusahaan.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 pt-6 md:mt-12 md:pt-10 border-t border-brand-gray-800">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Dapatkan Info Terbaru</h3>
              <p className="text-xs text-brand-gray-400 mt-1">
                Daftarkan email kamu untuk mendapatkan info drop terbaru dan promo eksklusif.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 md:mt-10 md:pt-6 border-t border-brand-gray-800 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-brand-gray-600">© {new Date().getFullYear()} DUTCH.IND. Hak Cipta Dilindungi.</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs text-brand-gray-600">Metode Pembayaran:</span>
            <div className="flex flex-wrap gap-1.5 text-xs text-brand-gray-500 font-mono">
              {["VISA","MASTERCARD","BCA","QRIS","TRANSFER"].map((m) => (
                <span key={m} className="px-2 py-0.5 border border-brand-gray-700">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

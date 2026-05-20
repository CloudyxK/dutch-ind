import Link from "next/link";
import { Instagram } from "lucide-react";

const WA_NUMBER = "6285217733737";
const WA_HREF = `https://wa.me/${WA_NUMBER}`;
const IG_HREF = "https://www.instagram.com/dutch.ind/";

const footerLinks = {
  produk: [
    { href: "/products?category=hoodie", label: "Hoodie" },
    { href: "/products?category=t-shirt", label: "T-Shirt" },
    { href: "/products?category=celana", label: "Celana" },
    { href: "/products?category=outerwear", label: "Outerwear" },
    { href: "/products?category=aksesori", label: "Aksesori" },
  ],
  bantuan: [
    { href: IG_HREF, label: "FAQ" },
    { href: IG_HREF, label: "Informasi Pengiriman" },
    { href: IG_HREF, label: "Pengembalian Barang" },
    { href: IG_HREF, label: "Panduan Ukuran" },
    { href: IG_HREF, label: "Hubungi Kami" },
  ],
  perusahaan: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/careers", label: "Karir" },
    { href: "/press", label: "Press" },
    { href: "/privacy", label: "Kebijakan Privasi" },
    { href: "/terms", label: "Syarat & Ketentuan" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-gray-900 border-t border-brand-gray-800">
      {/* Marquee banner */}
      <div className="border-b border-brand-gray-800 py-4 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <span
                  key={i}
                  className="inline-block px-8 text-xs font-bold uppercase tracking-widest text-brand-gray-500"
                >
                  DUTCH.IND &nbsp;/&nbsp; PREMIUM QUALITY &nbsp;/&nbsp; AUTHENTIC STYLE &nbsp;/&nbsp;
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-display tracking-widest">
              DUTCH.IND
            </Link>
            <p className="mt-4 text-sm text-brand-gray-400 leading-relaxed max-w-xs">
              Brand streetwear premium Indonesia. Kami menghadirkan desain eksklusif
              dengan kualitas terbaik untuk generasi urban yang berani tampil beda.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={IG_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
            <div className="mt-4 space-y-1">
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors"
              >
                <span>WA: 0852-1773-3737</span>
              </a>
              <a
                href={IG_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors"
              >
                <span>IG: @dutch.ind</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Produk</h3>
            <ul className="space-y-2">
              {footerLinks.produk.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Bantuan</h3>
            <ul className="space-y-2">
              {footerLinks.bantuan.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-brand-gray-800">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Dapatkan Info Terbaru
              </h3>
              <p className="text-xs text-brand-gray-400 mt-1">
                Daftarkan email kamu untuk mendapatkan info drop terbaru dan promo eksklusif.
              </p>
            </div>
            <form className="flex gap-0 w-full md:w-auto min-w-[320px]">
              <input
                type="email"
                placeholder="Email kamu"
                className="input-field flex-1 py-2"
              />
              <button type="submit" className="btn-primary px-5 py-2 whitespace-nowrap">
                Daftar
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-brand-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-xs text-brand-gray-600">
            © {new Date().getFullYear()} DUTCH.IND. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-brand-gray-600">Metode Pembayaran:</span>
            <div className="flex gap-2 text-xs text-brand-gray-500 font-mono">
              <span className="px-2 py-0.5 border border-brand-gray-700">VISA</span>
              <span className="px-2 py-0.5 border border-brand-gray-700">MASTERCARD</span>
              <span className="px-2 py-0.5 border border-brand-gray-700">BCA</span>
              <span className="px-2 py-0.5 border border-brand-gray-700">QRIS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

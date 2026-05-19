import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  produk: [
    { href: "/products?category=hoodie", label: "Hoodie" },
    { href: "/products?category=t-shirt", label: "T-Shirt" },
    { href: "/products?category=celana", label: "Celana" },
    { href: "/products?category=outerwear", label: "Outerwear" },
    { href: "/products?category=aksesori", label: "Aksesori" },
  ],
  bantuan: [
    { href: "/faq", label: "FAQ" },
    { href: "/shipping", label: "Informasi Pengiriman" },
    { href: "/returns", label: "Pengembalian Barang" },
    { href: "/size-guide", label: "Panduan Ukuran" },
    { href: "/contact", label: "Hubungi Kami" },
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
                href="#"
                className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-brand-gray-800 hover:bg-white hover:text-black transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
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

import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — DUTCH.IND",
  description:
    "Kebijakan privasi DUTCH.IND — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu.",
};

const sections = [
  { id: "pendahuluan", label: "Pendahuluan" },
  { id: "data-dikumpulkan", label: "Data yang Kami Kumpulkan" },
  { id: "penggunaan-data", label: "Cara Kami Menggunakan Data" },
  { id: "keamanan-data", label: "Keamanan Data" },
  { id: "cookie", label: "Cookie" },
  { id: "hak-pengguna", label: "Hak Pengguna" },
  { id: "perubahan-kebijakan", label: "Perubahan Kebijakan" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Beranda
        </Link>
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[.3em] text-brand-gray-500 mb-3">Legal</p>
          <h1 className="section-title mb-2">Kebijakan Privasi</h1>
          <p className="text-xs text-brand-gray-600">Berlaku sejak 1 Januari 2026</p>
        </div>

        <div className="lg:flex lg:gap-16">
          {/* Sticky sidebar nav — desktop only */}
          <nav className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-600 mb-4">
                Isi
              </p>
              <ul className="space-y-2.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-xs text-brand-gray-500 hover:text-white transition-colors duration-150 leading-snug block"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Introduction */}
            <section id="pendahuluan" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8 first:mt-0">
                Pendahuluan
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  DUTCH.IND adalah brand streetwear premium Indonesia yang berkomitmen penuh
                  menjaga privasi setiap penggunanya. Kebijakan ini menjelaskan bagaimana kami
                  mengumpulkan, menggunakan, dan melindungi informasi pribadi kamu saat
                  menggunakan layanan kami.
                </p>
                <p>
                  Dengan menggunakan platform DUTCH.IND, kamu menyetujui praktik yang
                  dijelaskan dalam kebijakan privasi ini.
                </p>
              </div>
            </section>

            {/* Section 1 */}
            <section id="data-dikumpulkan" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                1. Data yang Kami Kumpulkan
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>Saat kamu menggunakan platform kami, kami dapat mengumpulkan data berikut:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <span className="text-white font-medium">Identitas:</span> nama lengkap dan
                    alamat email
                  </li>
                  <li>
                    <span className="text-white font-medium">Pengiriman:</span> alamat lengkap,
                    kota, kode pos, nomor telepon
                  </li>
                  <li>
                    <span className="text-white font-medium">Transaksi:</span> riwayat pesanan,
                    detail pembayaran, metode pembayaran yang dipilih
                  </li>
                  <li>
                    <span className="text-white font-medium">Perangkat:</span> alamat IP, jenis
                    browser, sistem operasi, halaman yang dikunjungi
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="penggunaan-data" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                2. Cara Kami Menggunakan Data
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>Data yang kami kumpulkan digunakan untuk:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Memproses dan mengelola pesanan kamu</li>
                  <li>Mengirim email konfirmasi pesanan dan notifikasi pengiriman</li>
                  <li>Meningkatkan kualitas layanan dan pengalaman berbelanja</li>
                  <li>
                    Mengirim newsletter dan informasi produk terbaru (hanya jika kamu
                    berlangganan)
                  </li>
                  <li>Memenuhi kewajiban hukum yang berlaku di Indonesia</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="keamanan-data" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                3. Keamanan Data
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  Kami menyimpan seluruh data kamu menggunakan enkripsi standar industri.
                  Kata sandi disimpan dalam bentuk hash terenkripsi — tidak dapat dibaca oleh
                  siapapun, termasuk tim kami.
                </p>
                <p>
                  DUTCH.IND tidak pernah menjual, menyewakan, atau membagikan data pribadi
                  kamu kepada pihak ketiga untuk tujuan komersial. Data hanya dibagikan kepada
                  mitra layanan (ekspedisi, payment gateway) sejauh yang diperlukan untuk
                  memproses pesananmu.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="cookie" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                4. Cookie
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  Kami menggunakan cookie untuk meningkatkan pengalaman belanja kamu, termasuk
                  menyimpan isi keranjang belanja dan menjaga sesi login tetap aktif.
                </p>
                <p>
                  Cookie ini bersifat fungsional dan tidak digunakan untuk pelacakan iklan
                  pihak ketiga. Kamu dapat menonaktifkan cookie melalui pengaturan browser,
                  namun beberapa fitur platform mungkin tidak berfungsi optimal.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="hak-pengguna" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                5. Hak Pengguna
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>Kamu memiliki hak penuh atas data pribadimu, termasuk:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <span className="text-white font-medium">Akses:</span> meminta salinan data
                    pribadi yang kami simpan
                  </li>
                  <li>
                    <span className="text-white font-medium">Koreksi:</span> memperbarui data
                    yang tidak akurat melalui halaman profil atau menghubungi kami
                  </li>
                  <li>
                    <span className="text-white font-medium">Penghapusan:</span> meminta
                    penghapusan akun dan seluruh data terkait
                  </li>
                  <li>
                    <span className="text-white font-medium">Portabilitas:</span> menerima data
                    dalam format yang dapat dibaca mesin
                  </li>
                </ul>
                <p>
                  Untuk mengajukan permintaan, kirim email ke{" "}
                  <a
                    href="mailto:privacy@dutch-ind.com"
                    className="text-white underline hover:no-underline"
                  >
                    privacy@dutch-ind.com
                  </a>
                  . Kami akan merespons dalam 7 hari kerja.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="perubahan-kebijakan" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                6. Perubahan Kebijakan
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  Kami berhak memperbarui kebijakan privasi ini sewaktu-waktu. Setiap
                  perubahan signifikan akan diumumkan melalui website dan, jika memungkinkan,
                  melalui email ke pengguna terdaftar.
                </p>
                <p>
                  Terus menggunakan layanan DUTCH.IND setelah perubahan berlaku dianggap
                  sebagai persetujuan kamu terhadap kebijakan yang diperbarui.
                </p>
              </div>
            </section>

            {/* Footer note */}
            <div className="mt-12 pt-8 border-t border-brand-gray-800">
              <p className="text-xs text-brand-gray-600">Berlaku sejak 1 Januari 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

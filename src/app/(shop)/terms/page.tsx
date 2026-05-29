import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan â€” DUTCH.IND",
  description: "Syarat dan ketentuan penggunaan layanan DUTCH.IND.",
};

const sections = [
  { id: "pendahuluan", label: "Pendahuluan" },
  { id: "akun-pengguna", label: "Akun Pengguna" },
  { id: "pemesanan-pembayaran", label: "Pemesanan & Pembayaran" },
  { id: "pengiriman", label: "Pengiriman" },
  { id: "pengembalian-refund", label: "Pengembalian & Refund" },
  { id: "hak-kekayaan-intelektual", label: "Hak Kekayaan Intelektual" },
  { id: "larangan", label: "Larangan" },
  { id: "perubahan-syarat", label: "Perubahan Syarat" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[.3em] text-brand-gray-500 mb-3">Legal</p>
          <h1 className="section-title mb-2">Syarat &amp; Ketentuan</h1>
          <p className="text-xs text-brand-gray-600">Berlaku sejak 1 Januari 2026</p>
        </div>

        <div className="lg:flex lg:gap-16">
          {/* Sticky sidebar nav â€” desktop only */}
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
                  Dengan mengakses dan menggunakan layanan DUTCH.IND â€” termasuk website,
                  aplikasi, dan seluruh fitur yang tersedia â€” kamu menyatakan telah membaca,
                  memahami, dan menyetujui syarat dan ketentuan ini secara penuh.
                </p>
                <p>
                  Jika kamu tidak menyetujui salah satu bagian dari syarat ini, harap
                  hentikan penggunaan layanan kami. DUTCH.IND berhak memperbarui ketentuan
                  ini sewaktu-waktu.
                </p>
              </div>
            </section>

            {/* Section 1 */}
            <section id="akun-pengguna" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                1. Akun Pengguna
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Kamu sepenuhnya bertanggung jawab atas keamanan akun dan kerahasiaan
                    kata sandi â€” jangan bagikan kepada siapapun
                  </li>
                  <li>
                    Setiap pengguna hanya diperbolehkan memiliki satu akun aktif; akun
                    duplikat dapat dihapus tanpa pemberitahuan
                  </li>
                  <li>
                    Segera laporkan kepada kami jika kamu menduga akun telah diakses
                    tanpa izin
                  </li>
                  <li>
                    DUTCH.IND berhak menangguhkan atau menghapus akun yang melanggar
                    ketentuan ini
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="pemesanan-pembayaran" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                2. Pemesanan &amp; Pembayaran
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Seluruh harga yang tertera di platform dinyatakan dalam Rupiah (IDR)
                  </li>
                  <li>
                    Pembayaran harus diselesaikan dalam{" "}
                    <span className="text-white font-medium">24 jam</span> setelah pesanan
                    dibuat; lewat dari batas waktu tersebut, pesanan akan otomatis dibatalkan
                  </li>
                  <li>
                    Pesanan dianggap sah dan diproses hanya setelah konfirmasi pembayaran
                    diterima oleh sistem kami
                  </li>
                  <li>
                    DUTCH.IND berhak membatalkan pesanan yang terindikasi fraud, pemesanan
                    massal tidak wajar, atau kesalahan harga sistem
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="pengiriman" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                3. Pengiriman
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Estimasi waktu pengiriman yang ditampilkan bersifat perkiraan dan tidak
                    menjamin waktu tiba yang pasti
                  </li>
                  <li>
                    Keterlambatan yang disebabkan oleh jasa ekspedisi, kondisi cuaca, atau
                    force majeure bukan merupakan tanggung jawab DUTCH.IND
                  </li>
                  <li>
                    Pastikan alamat pengiriman yang kamu masukkan sudah benar; kami tidak
                    bertanggung jawab atas ketidaktepatan alamat yang diberikan pembeli
                  </li>
                  <li>
                    Kamu dapat melacak status pengiriman melalui halaman{" "}
                    <span className="text-white font-medium">Lacak Pesanan</span> di platform
                    kami
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="pengembalian-refund" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                4. Pengembalian &amp; Refund
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Produk yang diterima dalam kondisi rusak atau tidak sesuai pesanan dapat
                    dikembalikan dalam{" "}
                    <span className="text-white font-medium">3 hari</span> setelah barang
                    diterima
                  </li>
                  <li>
                    Pengembalian hanya diterima jika produk belum dipakai, tag masih
                    terpasang, dan dikemas dengan kemasan asli
                  </li>
                  <li>
                    Refund untuk produk cacat atau salah kirim ditanggung penuh oleh DUTCH.IND,
                    termasuk ongkos kirim retur
                  </li>
                  <li>
                    Refund diproses dalam{" "}
                    <span className="text-white font-medium">3â€“7 hari kerja</span> setelah
                    barang diterima dan diperiksa oleh tim kami
                  </li>
                  <li>
                    Pengembalian karena alasan lain (salah ukuran, berubah pikiran) ditanggung
                    oleh pembeli dan hanya berlaku untuk produk yang belum pernah dipakai
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="hak-kekayaan-intelektual" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                5. Hak Kekayaan Intelektual
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  Seluruh konten yang tersedia di platform DUTCH.IND â€” termasuk namun tidak
                  terbatas pada foto produk, desain grafis, logo, nama brand, teks, dan
                  tampilan antarmuka â€” adalah milik eksklusif DUTCH.IND dan dilindungi
                  oleh hukum hak cipta Republik Indonesia.
                </p>
                <p>
                  Tidak ada konten dari platform ini yang boleh digunakan, disalin,
                  direproduksi, atau didistribusikan dalam bentuk apapun tanpa izin
                  tertulis sebelumnya dari DUTCH.IND.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="larangan" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                6. Larangan
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>Pengguna dilarang keras untuk:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    Menjual kembali produk DUTCH.IND secara komersial tanpa perjanjian
                    reseller tertulis dari kami
                  </li>
                  <li>
                    Memalsukan, meniru, atau membuat produk yang menyerupai desain DUTCH.IND
                  </li>
                  <li>
                    Menggunakan foto, desain, atau konten brand DUTCH.IND tanpa izin
                    tertulis
                  </li>
                  <li>
                    Melakukan tindakan yang dapat merusak reputasi atau kepercayaan terhadap
                    brand DUTCH.IND
                  </li>
                  <li>
                    Menggunakan platform kami untuk tujuan yang melanggar hukum yang berlaku
                    di Indonesia
                  </li>
                </ul>
                <p>
                  Pelanggaran terhadap larangan ini dapat mengakibatkan penangguhan akun
                  dan tindakan hukum yang sesuai.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="perubahan-syarat" className="scroll-mt-24">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gray-400 mb-3 mt-8">
                7. Perubahan Syarat
              </h2>
              <div className="text-sm text-brand-gray-300 leading-relaxed space-y-2">
                <p>
                  DUTCH.IND berhak mengubah syarat dan ketentuan ini kapan saja tanpa
                  pemberitahuan sebelumnya. Perubahan akan berlaku efektif sejak dipublikasikan
                  di website kami.
                </p>
                <p>
                  Kami menyarankan kamu untuk meninjau halaman ini secara berkala.
                  Terus menggunakan layanan kami setelah perubahan dipublikasikan dianggap
                  sebagai penerimaan terhadap syarat yang diperbarui.
                </p>
              </div>
            </section>

            {/* Contact */}
            <div className="mt-12 pt-8 border-t border-brand-gray-800">
              <p className="text-xs text-brand-gray-500 mb-1">Pertanyaan seputar syarat &amp; ketentuan?</p>
              <a
                href="mailto:info@dutch-ind.com"
                className="text-xs text-white underline hover:no-underline"
              >
                info@dutch-ind.com
              </a>
              <p className="text-xs text-brand-gray-600 mt-4">Berlaku sejak 1 Januari 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

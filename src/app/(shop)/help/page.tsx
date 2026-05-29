import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bantuan — DUTCH.IND",
  description: "Panduan ukuran, cara pemesanan, informasi pengiriman, pengembalian barang, dan FAQ DUTCH.IND.",
};

const sections = [
  { id: "ukuran",        label: "Panduan Ukuran"       },
  { id: "cara-pemesanan", label: "Cara Pemesanan"       },
  { id: "pengiriman",    label: "Informasi Pengiriman"  },
  { id: "pengembalian",  label: "Pengembalian Barang"   },
  { id: "faq",           label: "FAQ"                   },
];

const sizeData = [
  { size: "XS",  chest: "84–88",  shoulder: "41–42", length: "67" },
  { size: "S",   chest: "88–92",  shoulder: "43–44", length: "69" },
  { size: "M",   chest: "92–96",  shoulder: "45–46", length: "71" },
  { size: "L",   chest: "96–100", shoulder: "47–48", length: "73" },
  { size: "XL",  chest: "100–104",shoulder: "49–50", length: "75" },
  { size: "XXL", chest: "104–110",shoulder: "51–53", length: "77" },
];

const faqItems = [
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), QRIS, kartu kredit/debit VISA & Mastercard, serta dompet digital (GoPay, OVO, Dana, ShopeePay) melalui gateway Midtrans.",
  },
  {
    q: "Bagaimana cara mengetahui ukuran yang tepat untuk saya?",
    a: "Gunakan tabel Panduan Ukuran di atas sebagai acuan. Ukur lingkar dada kamu saat berdiri tegak dan cocokkan dengan kolom Dada. Jika kamu berada di antara dua ukuran, kami sarankan memilih ukuran yang lebih besar untuk kenyamanan.",
  },
  {
    q: "Apakah pesanan bisa dilacak?",
    a: "Ya. Setelah pesanan dikirim, kamu akan menerima nomor resi via email dan WhatsApp. Lacak paketmu langsung di situs resmi JNE (jne.co.id) atau ekspedisi lain yang tertera.",
  },
  {
    q: "Berapa lama proses pengiriman setelah pembayaran dikonfirmasi?",
    a: "Pesanan diproses dalam 1–2 hari kerja setelah pembayaran terverifikasi. Waktu pengiriman bergantung pada ekspedisi yang dipilih (lihat bagian Informasi Pengiriman).",
  },
  {
    q: "Apakah ada diskon untuk pembelian dalam jumlah banyak?",
    a: "Untuk pembelian grosir atau kolaborasi brand, silakan hubungi kami langsung melalui halaman Hubungi Kami atau WhatsApp kami untuk info lebih lanjut.",
  },
  {
    q: "Apakah produk DUTCH.IND bisa dicicil?",
    a: "Ya, cicilan 0% tersedia untuk kartu kredit tertentu melalui Midtrans. Opsi cicilan akan muncul di halaman pembayaran jika kartu kamu memenuhi syarat.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-brand-gray-800 py-16">
        <div className="container-main">
          <p className="text-xs uppercase tracking-[.3em] text-brand-gray-500 mb-3">Pusat Bantuan</p>
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-wider">Bantuan</h1>
          <p className="mt-4 text-brand-gray-400 text-sm max-w-lg leading-relaxed">
            Semua yang perlu kamu tahu tentang ukuran, pemesanan, pengiriman, dan pengembalian barang.
          </p>
        </div>
      </div>

      <div className="container-main py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* Sidebar nav — hidden on mobile */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-4">Daftar Isi</p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs text-brand-gray-400 hover:text-white transition-colors py-1.5 border-l-2 border-transparent hover:border-white pl-3"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* Panduan Ukuran */}
            <section id="ukuran" className="scroll-mt-24">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-2">01</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-6">Panduan Ukuran</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-6">
                Semua ukuran di bawah dalam satuan <strong className="text-white">sentimeter (cm)</strong> dan
                mengacu pada dimensi pakaian, bukan tubuh. Untuk hasil terbaik, bandingkan dengan pakaian
                favoritmu yang sudah diukur sebelumnya.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-brand-gray-800">
                  <thead>
                    <tr className="bg-brand-gray-900 border-b border-brand-gray-800">
                      <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-brand-gray-500 font-normal">Ukuran</th>
                      <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-brand-gray-500 font-normal">Dada (cm)</th>
                      <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-brand-gray-500 font-normal">Bahu (cm)</th>
                      <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-brand-gray-500 font-normal">Panjang (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row, i) => (
                      <tr
                        key={row.size}
                        className={`border-b border-brand-gray-800 ${i % 2 === 0 ? "bg-brand-black" : "bg-brand-gray-900"}`}
                      >
                        <td className="py-3 px-4 font-bold tracking-widest">{row.size}</td>
                        <td className="py-3 px-4 text-brand-gray-400">{row.chest}</td>
                        <td className="py-3 px-4 text-brand-gray-400">{row.shoulder}</td>
                        <td className="py-3 px-4 text-brand-gray-400">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-brand-gray-600 leading-relaxed">
                Ukuran dapat bervariasi sedikit (±1–2 cm) tergantung model produk. Lihat detail ukuran spesifik
                di halaman masing-masing produk.
              </p>
            </section>

            {/* Cara Pemesanan */}
            <section id="cara-pemesanan" className="scroll-mt-24">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-2">02</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-6">Cara Pemesanan</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-8">
                Ikuti langkah-langkah berikut untuk menyelesaikan pembelian di DUTCH.IND.
              </p>

              <div className="space-y-0 border-l border-brand-gray-800 pl-6 ml-4">
                {[
                  {
                    step: "Buat Akun atau Masuk",
                    desc: "Daftar dengan email atau masuk ke akun yang sudah ada. Akun diperlukan untuk melacak pesanan dan menyimpan alamat pengiriman.",
                  },
                  {
                    step: "Pilih Produk",
                    desc: "Jelajahi koleksi di halaman Produk. Pilih ukuran dan warna yang tersedia, lalu klik \"Tambah ke Keranjang\".",
                  },
                  {
                    step: "Periksa Keranjang",
                    desc: "Buka keranjang belanja dan pastikan semua item, ukuran, dan jumlah sudah benar sebelum lanjut.",
                  },
                  {
                    step: "Isi Alamat Pengiriman",
                    desc: "Masukkan alamat lengkap termasuk kode pos. Kamu bisa menyimpan beberapa alamat untuk penggunaan berikutnya.",
                  },
                  {
                    step: "Pilih Ekspedisi",
                    desc: "Pilih layanan pengiriman yang tersedia. Ongkos kirim dihitung otomatis berdasarkan berat dan tujuan pengiriman.",
                  },
                  {
                    step: "Lakukan Pembayaran",
                    desc: "Selesaikan pembayaran melalui gateway Midtrans yang aman. Konfirmasi pesanan akan dikirim ke emailmu setelah pembayaran berhasil.",
                  },
                  {
                    step: "Lacak Pesanan",
                    desc: "Cek status pesanan di halaman Profil > Pesanan Saya. Nomor resi akan muncul setelah paket dikirim.",
                  },
                ].map((item, i) => (
                  <div key={i} className="relative pb-8 last:pb-0">
                    <div className="absolute -left-[29px] w-3 h-3 bg-brand-gray-800 border border-brand-gray-700" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-600 mb-1">
                      Langkah {i + 1}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wide mb-2">{item.step}</p>
                    <p className="text-sm text-brand-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Informasi Pengiriman */}
            <section id="pengiriman" className="scroll-mt-24">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-2">03</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-6">Informasi Pengiriman</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-8">
                Kami mengirimkan ke seluruh Indonesia melalui mitra ekspedisi terpercaya.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-gray-800">
                {[
                  {
                    title: "JNE Regular (REG)",
                    detail: "Estimasi 3–5 hari kerja",
                    note: "Tersedia ke seluruh Indonesia",
                  },
                  {
                    title: "JNE YES (Yakin Esok Sampai)",
                    detail: "Estimasi 1 hari kerja",
                    note: "Tersedia untuk kota-kota tertentu",
                  },
                  {
                    title: "JNE OKE",
                    detail: "Estimasi 5–7 hari kerja",
                    note: "Tarif lebih hemat",
                  },
                  {
                    title: "Ekspedisi Lain",
                    detail: "Tergantung ketersediaan rute",
                    note: "Pilihan muncul saat checkout",
                  },
                ].map((s) => (
                  <div key={s.title} className="bg-brand-gray-900 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2">{s.title}</p>
                    <p className="text-sm text-brand-gray-300">{s.detail}</p>
                    <p className="text-xs text-brand-gray-600 mt-1">{s.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 p-4 border border-brand-gray-800 bg-brand-gray-900">
                  <div className="w-1 h-1 bg-white mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-brand-gray-400">
                    <strong className="text-white">Gratis ongkos kirim</strong> untuk pembelian di atas{" "}
                    <strong className="text-white">Rp500.000</strong> (JNE Regular ke seluruh Indonesia).
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 border border-brand-gray-800 bg-brand-gray-900">
                  <div className="w-1 h-1 bg-white mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-brand-gray-400">
                    Pesanan dikemas dalam <strong className="text-white">1–2 hari kerja</strong> setelah pembayaran terverifikasi.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 border border-brand-gray-800 bg-brand-gray-900">
                  <div className="w-1 h-1 bg-white mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-brand-gray-400">
                    Semua paket dilindungi asuransi pengiriman untuk ketenangan pikiran kamu.
                  </p>
                </div>
              </div>
            </section>

            {/* Pengembalian Barang */}
            <section id="pengembalian" className="scroll-mt-24">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-2">04</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-6">Pengembalian Barang</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-8">
                Kami ingin kamu puas dengan setiap pembelian. Jika ada masalah, kami siap membantu.
              </p>

              <div className="space-y-6">
                <div className="p-5 border border-brand-gray-800 bg-brand-gray-900">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3">Syarat Pengembalian</p>
                  <ul className="space-y-2">
                    {[
                      "Pengembalian diajukan dalam 14 hari kalender setelah barang diterima",
                      "Barang belum pernah dipakai, dicuci, atau dimodifikasi",
                      "Tag harga dan label brand masih terpasang",
                      "Barang dikembalikan dalam kemasan asli atau kemasan yang setara",
                      "Disertai foto kondisi barang dan bukti pembelian (nomor pesanan)",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-brand-gray-400">
                        <div className="w-1 h-1 bg-brand-gray-600 mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 border border-brand-gray-800 bg-brand-gray-900">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3">Produk yang Tidak Dapat Dikembalikan</p>
                  <ul className="space-y-2">
                    {[
                      "Produk edisi terbatas (limited drop) yang sudah tertera keterangan final sale",
                      "Aksesori yang sudah dibuka dari kemasan segel",
                      "Produk yang dibeli saat promo clearance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-brand-gray-400">
                        <div className="w-1 h-1 bg-brand-gray-600 mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 border border-brand-gray-800 bg-brand-gray-900">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3">Cara Mengajukan Pengembalian</p>
                  <div className="space-y-3">
                    {[
                      "Hubungi kami via WhatsApp atau halaman Kontak dengan nomor pesanan kamu.",
                      "Tim kami akan mengkonfirmasi kelayakan pengembalian dalam 1–2 hari kerja.",
                      "Setelah disetujui, kirim barang ke alamat yang kami berikan. Ongkos kirim pengembalian ditanggung pembeli kecuali ada kesalahan dari kami.",
                      "Pengembalian dana atau penukaran produk diproses dalam 3–5 hari kerja setelah barang kami terima.",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-brand-gray-400">
                        <span className="font-mono text-brand-gray-600 flex-shrink-0">{i + 1}.</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray-600 mb-2">05</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-6">FAQ</h2>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-8">
                Pertanyaan yang sering kami terima dari pelanggan.
              </p>

              <div className="space-y-px">
                {faqItems.map((item, i) => (
                  <div key={i} className="bg-brand-gray-900 border border-brand-gray-800 p-5">
                    <p className="text-sm font-bold uppercase tracking-wide mb-3">{item.q}</p>
                    <p className="text-sm text-brand-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="border border-brand-gray-700 p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Masih Ada Pertanyaan?</p>
              <h2 className="text-xl font-display uppercase tracking-wider mb-5">Hubungi Kami Langsung</h2>
              <p className="text-sm text-brand-gray-400 mb-6 max-w-md mx-auto">
                Tim kami siap membantu kamu melalui WhatsApp atau form kontak di bawah ini.
              </p>
              <Link href="/contact" className="btn-primary inline-flex">
                Hubungi Kami
              </Link>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

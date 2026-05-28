import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — DUTCH.IND",
  description: "Kebijakan privasi DUTCH.IND — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu.",
};

export default function PrivacyPage() {
  const lastUpdated = "1 Januari 2025";

  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Legal</p>
        <h1 className="text-3xl font-display uppercase tracking-wider mb-2">Kebijakan Privasi</h1>
        <p className="text-xs text-brand-gray-600 mb-12">Terakhir diperbarui: {lastUpdated}</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-brand-gray-400 leading-relaxed">

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">1. Pendahuluan</h2>
            <p>
              DUTCH.IND ("kami", "kita") berkomitmen untuk melindungi privasi penggunanya.
              Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga
              informasi pribadi kamu saat menggunakan layanan kami di dutch-ind.vercel.app.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">2. Data Yang Kami Kumpulkan</h2>
            <p className="mb-3">Saat kamu menggunakan platform kami, kami dapat mengumpulkan:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-white">Data akun:</strong> nama, alamat email, nomor telepon, kata sandi terenkripsi</li>
              <li><strong className="text-white">Data transaksi:</strong> alamat pengiriman, riwayat pesanan, metode pembayaran</li>
              <li><strong className="text-white">Data teknis:</strong> alamat IP, jenis browser, halaman yang dikunjungi</li>
              <li><strong className="text-white">Data opsional:</strong> foto profil, username Instagram</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">3. Penggunaan Data</h2>
            <p className="mb-3">Kami menggunakan data kamu untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Memproses dan mengantarkan pesanan kamu</li>
              <li>Mengirim konfirmasi pesanan dan notifikasi pengiriman</li>
              <li>Memberikan layanan pelanggan</li>
              <li>Meningkatkan pengalaman berbelanja di platform kami</li>
              <li>Memenuhi kewajiban hukum yang berlaku di Indonesia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">4. Penyimpanan dan Keamanan</h2>
            <p>
              Data kamu disimpan di server yang dilindungi dengan enkripsi standar industri.
              Kata sandi disimpan dalam bentuk terenkripsi (bcrypt) dan tidak dapat dibaca oleh siapapun,
              termasuk tim kami. Kami menggunakan HTTPS untuk semua komunikasi data.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">5. Berbagi Data dengan Pihak Ketiga</h2>
            <p className="mb-3">Kami dapat berbagi data dengan pihak ketiga berikut <em>hanya</em> sejauh diperlukan:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-white">Midtrans</strong> — pemrosesan pembayaran (data transaksi)</li>
              <li><strong className="text-white">Brevo</strong> — pengiriman email transaksional</li>
              <li><strong className="text-white">Cloudinary</strong> — penyimpanan gambar (foto profil, produk)</li>
              <li><strong className="text-white">Jasa ekspedisi</strong> — nama dan alamat pengiriman untuk proses pengiriman</li>
            </ul>
            <p className="mt-3">Kami tidak menjual data pribadi kamu kepada pihak manapun.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">6. Hak Kamu</h2>
            <p className="mb-3">Kamu memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Mengakses dan memperbarui data pribadi kamu melalui halaman profil</li>
              <li>Menghapus akun dan data terkait dengan menghubungi kami</li>
              <li>Menolak menerima email pemasaran (unsubscribe tersedia di setiap email)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">7. Cookie</h2>
            <p>
              Kami menggunakan cookie yang diperlukan untuk fungsi autentikasi (login session).
              Kami tidak menggunakan cookie untuk pelacakan pemasaran pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">8. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan kami
              informasikan melalui email atau notifikasi di platform. Tanggal "Terakhir diperbarui"
              di atas akan mencerminkan pembaruan terbaru.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">9. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan terkait privasi, hubungi kami di:{" "}
              <a href="mailto:adinbilok@gmail.com" className="text-white underline hover:no-underline">
                adinbilok@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

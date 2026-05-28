import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — DUTCH.IND",
  description: "Syarat dan ketentuan penggunaan layanan DUTCH.IND.",
};

export default function TermsPage() {
  const lastUpdated = "1 Januari 2025";

  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Legal</p>
        <h1 className="text-3xl font-display uppercase tracking-wider mb-2">Syarat & Ketentuan</h1>
        <p className="text-xs text-brand-gray-600 mb-12">Terakhir diperbarui: {lastUpdated}</p>

        <div className="space-y-10 text-brand-gray-400 leading-relaxed text-sm">

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses dan menggunakan platform DUTCH.IND, kamu menyatakan telah membaca,
              memahami, dan menyetujui syarat dan ketentuan ini. Jika tidak setuju, harap tidak
              menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">2. Akun Pengguna</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Kamu bertanggung jawab menjaga kerahasiaan kata sandi akun</li>
              <li>Satu akun hanya untuk satu pengguna — tidak diperbolehkan berbagi akun</li>
              <li>Kami berhak menangguhkan akun yang terindikasi disalahgunakan</li>
              <li>Kamu harus berusia minimal 17 tahun untuk melakukan transaksi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">3. Pemesanan dan Pembayaran</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Pesanan dianggap sah setelah pembayaran dikonfirmasi</li>
              <li>Harga yang tertera sudah termasuk PPN (jika berlaku)</li>
              <li>Kami berhak membatalkan pesanan yang terindikasi fraud atau pemesanan massal tidak wajar</li>
              <li>Untuk pembayaran manual (transfer), bukti pembayaran wajib diunggah dalam 24 jam</li>
              <li>Pesanan yang tidak dibayar dalam 24 jam akan otomatis dibatalkan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">4. Pengiriman</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Estimasi waktu pengiriman bersifat perkiraan dan bukan jaminan</li>
              <li>DUTCH.IND tidak bertanggung jawab atas keterlambatan yang disebabkan oleh jasa ekspedisi</li>
              <li>Risiko kehilangan/kerusakan selama pengiriman ditanggung sesuai kebijakan ekspedisi</li>
              <li>Pastikan alamat pengiriman benar — kami tidak bertanggung jawab atas kesalahan alamat</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">5. Pengembalian dan Refund</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Pengembalian dapat dilakukan dalam <strong className="text-white">14 hari</strong> setelah barang diterima</li>
              <li>Syarat pengembalian: produk belum dipakai, tag masih terpasang, kemasan asli</li>
              <li>Pengembalian karena cacat produksi ditanggung penuh oleh DUTCH.IND (termasuk ongkos kirim)</li>
              <li>Pengembalian karena salah pilih ukuran/warna, ongkos kirim ditanggung pembeli</li>
              <li>Refund diproses dalam 3-7 hari kerja setelah barang diterima dan diperiksa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">6. Produk dan Stok</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Semua foto produk adalah representasi akurat sesuai kondisi aktual</li>
              <li>Perbedaan warna minor akibat kalibrasi layar dianggap bukan cacat</li>
              <li>Kami berhak menghentikan produksi atau mengubah harga produk sewaktu-waktu</li>
              <li>Stok yang ditampilkan bersifat real-time — tidak ada reservasi stok tanpa pembayaran</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">7. Kekayaan Intelektual</h2>
            <p>
              Semua konten di platform ini — termasuk desain, logo, foto produk, dan teks —
              adalah milik DUTCH.IND dan dilindungi hak cipta. Dilarang menggunakan,
              mereproduksi, atau mendistribusikan tanpa izin tertulis dari kami.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">8. Batasan Tanggung Jawab</h2>
            <p>
              DUTCH.IND tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau
              konsekuensial yang timbul dari penggunaan platform atau produk kami, sejauh
              diizinkan oleh hukum yang berlaku di Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">9. Hukum yang Berlaku</h2>
            <p>
              Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.
              Setiap perselisihan diselesaikan melalui mediasi terlebih dahulu,
              dan jika tidak berhasil, melalui Pengadilan Negeri Samarinda.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-3">10. Kontak</h2>
            <p>
              Pertanyaan seputar syarat & ketentuan:{" "}
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

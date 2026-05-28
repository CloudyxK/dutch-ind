import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang Kami — DUTCH.IND",
  description: "DUTCH.IND adalah brand streetwear premium dari Samarinda, Kalimantan Timur. Dibuat untuk mereka yang berani tampil beda.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative border-b border-brand-gray-800 py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url(/logo.png)",
            backgroundSize: "300px auto",
            backgroundRepeat: "repeat",
            filter: "brightness(3) saturate(0)",
            mixBlendMode: "screen",
          }}
          aria-hidden
        />
        <div className="container-main max-w-3xl relative">
          <p className="text-xs uppercase tracking-[.3em] text-brand-gray-500 mb-4">Brand Story</p>
          <h1 className="text-5xl md:text-7xl font-display uppercase tracking-wider leading-none mb-6">
            DUTCH.<span className="text-brand-gray-600">IND</span>
          </h1>
          <p className="text-lg text-brand-gray-300 max-w-xl leading-relaxed">
            Lahir dari jalanan Samarinda. Dibuat untuk mereka yang tidak minta izin untuk tampil.
          </p>
        </div>
      </div>

      <div className="container-main max-w-3xl py-16 space-y-20">

        {/* Origin */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Asal Usul</p>
            <h2 className="text-2xl font-display uppercase tracking-wider mb-5">Dari Kalimantan, Untuk Indonesia</h2>
            <p className="text-brand-gray-400 leading-relaxed text-sm">
              DUTCH.IND dimulai bukan dari gedung bertingkat di Jakarta — tapi dari kamar kecil di Samarinda, Kalimantan Timur.
              Dari frustrasi yang sama: brand streetwear lokal kualitasnya bagus, tapi tampilannya generik.
            </p>
            <p className="text-brand-gray-400 leading-relaxed text-sm mt-4">
              Kami percaya kota Tier 2 punya gaya yang sama tajamnya. DUTCH.IND adalah buktinya.
            </p>
          </div>
          <div className="bg-brand-gray-900 border border-brand-gray-700 aspect-square flex items-center justify-center">
            <div className="text-center p-8">
              <p className="font-display text-6xl uppercase tracking-widest text-brand-gray-700">SMR</p>
              <p className="text-xs text-brand-gray-600 tracking-widest mt-2 uppercase">Samarinda, Kaltim</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Nilai Kami</p>
          <h2 className="text-2xl font-display uppercase tracking-wider mb-8">Tiga Hal Yang Tidak Kami Kompromikan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-gray-800">
            {[
              {
                number: "01",
                title: "Kualitas Material",
                body: "Setiap kain dipilih manual. Kalau tidak nyaman dipakai 12 jam, tidak akan kami jual.",
              },
              {
                number: "02",
                title: "Desain Tanpa Filter",
                body: "Kami tidak desain untuk semua orang. Kami desain untuk orang yang tahu apa yang mereka mau.",
              },
              {
                number: "03",
                title: "Produksi Terbatas",
                body: "Tidak ada restok tanpa alasan. Setiap drop adalah edisi — selesai ya selesai.",
              },
            ].map((v) => (
              <div key={v.number} className="bg-brand-black p-8">
                <p className="font-mono text-brand-gray-700 text-sm mb-4">{v.number}</p>
                <p className="font-bold uppercase tracking-wide mb-3 text-sm">{v.title}</p>
                <p className="text-xs text-brand-gray-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-3">Proses</p>
          <h2 className="text-2xl font-display uppercase tracking-wider mb-8">Dari Sketsa ke Jalanan</h2>
          <div className="space-y-0 border-l border-brand-gray-800 pl-6 ml-4">
            {[
              { step: "Riset & Konsep", desc: "Setiap koleksi dimulai dari referensi nyata — jalanan, arsitektur, subkultur lokal." },
              { step: "Pengembangan Material", desc: "Kami pilih vendor kain langsung. Tidak ada bahan asal-asalan." },
              { step: "Prototype & Revisi", desc: "Minimal 3 iterasi sebelum sebuah desain disetujui untuk produksi." },
              { step: "Produksi Terbatas", desc: "Setiap drop dibatasi. Ini bukan trik marketing — ini kontrol kualitas." },
              { step: "Quality Check", desc: "Setiap item dicek manual sebelum dikemas dan dikirim ke kamu." },
            ].map((item, i) => (
              <div key={i} className="relative pb-8 last:pb-0">
                <div className="absolute -left-[29px] w-3 h-3 bg-brand-gray-700 border border-brand-gray-600" />
                <p className="text-xs font-bold uppercase tracking-widest mb-1">{item.step}</p>
                <p className="text-sm text-brand-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border border-brand-gray-700 p-10 text-center">
          <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-4">Siap?</p>
          <h2 className="text-2xl font-display uppercase tracking-wider mb-6">Lihat Koleksi Terbaru</h2>
          <Link href="/products" className="btn-primary inline-flex">
            Jelajahi Produk →
          </Link>
        </section>

      </div>
    </div>
  );
}

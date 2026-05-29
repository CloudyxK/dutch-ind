import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Lacak Pesanan — DUTCH.IND",
  description: "Lacak status pesananmu dengan nomor order.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // If they submitted via GET form, redirect to the order page
  if (q?.trim()) {
    redirect(`/track/${encodeURIComponent(q.trim())}`);
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-brand-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Beranda
        </Link>
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gray-500 mb-3">
            Order Tracking
          </p>
          <h1 className="text-3xl font-display font-bold tracking-widest uppercase text-white">
            Lacak Pesanan
          </h1>
          <p className="mt-3 text-sm text-brand-gray-400">
            Masukkan nomor pesananmu untuk melihat status pengiriman.
          </p>
        </div>

        {/* Form */}
        <form action="/track" method="GET" className="space-y-4">
          <div>
            <label
              htmlFor="q"
              className="block text-xs font-semibold uppercase tracking-widest text-brand-gray-400 mb-2"
            >
              Nomor Pesanan
            </label>
            <input
              id="q"
              name="q"
              type="text"
              required
              placeholder="Contoh: ORD-20240101-XXXXX"
              className="w-full bg-brand-gray-900 border border-brand-gray-700 text-white text-sm px-4 py-3 placeholder-brand-gray-600 focus:outline-none focus:border-white transition-colors font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary text-sm uppercase tracking-widest py-3"
          >
            Lacak Sekarang
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brand-gray-600">
          Nomor pesanan bisa ditemukan di email konfirmasi pesananmu.
        </p>
      </div>
    </main>
  );
}

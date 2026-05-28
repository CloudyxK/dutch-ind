import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import DropWaitlistForm from "@/components/drops/DropWaitlistForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const drop = await prisma.drop.findUnique({ where: { slug } });
  if (!drop) return { title: "Drop Tidak Ditemukan" };
  return {
    title: `${drop.name} — DUTCH.IND`,
    description: drop.description ?? `Drop eksklusif ${drop.name} dari DUTCH.IND.`,
  };
}

export default async function DropDetailPage({ params }: Props) {
  const { slug } = await params;
  const drop = await prisma.drop.findUnique({
    where: { slug },
    include: { _count: { select: { waitlist: true } } },
  });

  if (!drop) notFound();

  const isLive     = drop.status === "LIVE";
  const isEnded    = drop.status === "ENDED";
  const isUpcoming = drop.status === "UPCOMING";

  const releaseDate = new Date(drop.releaseDate);
  const dateStr = releaseDate.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative border-b border-brand-gray-800 overflow-hidden" style={{ minHeight: "60vh" }}>
        {drop.coverImage ? (
          <>
            <Image src={drop.coverImage} alt={drop.name} fill className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-gray-900" />
        )}

        <div className="relative z-10 container-main max-w-3xl py-24 flex flex-col justify-end h-full" style={{ minHeight: "60vh" }}>
          <div className="mt-auto">
            {isLive && (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live Now</span>
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.4em] text-brand-gray-400 mb-3">{dateStr}</p>
            <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider leading-none mb-4">
              {drop.name}
            </h1>
            {drop.description && (
              <p className="text-brand-gray-300 text-sm max-w-lg leading-relaxed">{drop.description}</p>
            )}
            <p className="text-xs text-brand-gray-500 mt-4">{drop._count.waitlist} orang mendaftar waitlist</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-main max-w-3xl py-12">
        {isLive && (
          <div className="text-center border border-white/20 p-10 mb-8">
            <p className="text-xs uppercase tracking-widest text-brand-gray-400 mb-3">Drop ini sekarang tersedia</p>
            <h2 className="text-2xl font-display uppercase tracking-wider mb-4">Belanja Sekarang</h2>
            {drop.couponCode && (
              <p className="text-sm text-brand-gray-300 mb-5">
                Gunakan kode <span className="font-bold text-white tracking-widest">{drop.couponCode}</span> untuk diskon eksklusif.
              </p>
            )}
            <Link href="/products" className="btn-primary inline-flex">Lihat Koleksi →</Link>
          </div>
        )}

        {isUpcoming && (
          <div className="border border-brand-gray-700 p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Daftar Waitlist</h2>
            <p className="text-xs text-brand-gray-400 mb-6">
              Masukkan email kamu untuk mendapat notifikasi pertama saat drop ini live. Member waitlist mendapat akses kode diskon eksklusif.
            </p>
            <DropWaitlistForm slug={drop.slug} />
          </div>
        )}

        {isEnded && (
          <div className="text-center border border-brand-gray-800 p-10">
            <p className="text-brand-gray-500 text-sm">Drop ini sudah berakhir.</p>
            <Link href="/drops" className="text-xs text-white underline mt-3 inline-block">Lihat Drop Berikutnya →</Link>
          </div>
        )}

        <div className="mt-8">
          <Link href="/drops" className="text-xs text-brand-gray-500 hover:text-white transition-colors">
            ← Semua Drops
          </Link>
        </div>
      </div>
    </div>
  );
}

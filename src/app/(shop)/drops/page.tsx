import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Drops — DUTCH.IND",
  description: "Jadwal drop eksklusif DUTCH.IND. Daftarkan email kamu dan jadilah yang pertama tahu.",
};

export default async function DropsPage() {
  const drops = await prisma.drop.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    include: { _count: { select: { waitlist: true } } },
    orderBy: { releaseDate: "asc" },
  });

  const pastDrops = await prisma.drop.findMany({
    where: { status: "ENDED" },
    orderBy: { releaseDate: "desc" },
    take: 4,
  });

  return (
    <div className="min-h-screen py-16">
      <div className="container-main max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.4em] text-brand-gray-500 mb-3">Limited Releases</p>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider leading-none">
            Upcoming<br />
            <span className="text-brand-gray-700">Drops</span>
          </h1>
          <p className="text-sm text-brand-gray-400 mt-4 max-w-md">
            Setiap drop DUTCH.IND adalah edisi terbatas. Daftar waitlist untuk mendapat notifikasi pertama dan kode diskon eksklusif.
          </p>
        </div>

        {/* Upcoming & live drops */}
        {drops.length === 0 ? (
          <div className="border border-brand-gray-800 p-16 text-center mb-12">
            <p className="text-brand-gray-500 text-sm">Belum ada drop yang diumumkan.</p>
            <p className="text-brand-gray-600 text-xs mt-2">Pantau terus halaman ini untuk update terbaru.</p>
          </div>
        ) : (
          <div className="space-y-6 mb-16">
            {drops.map((drop) => {
              const isLive    = drop.status === "LIVE";
              const isPast    = new Date(drop.releaseDate) < new Date() && !isLive;
              const dateStr   = new Date(drop.releaseDate).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              });

              return (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.slug}`}
                  className="group flex flex-col sm:flex-row gap-0 border border-brand-gray-800 hover:border-white transition-colors overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="relative w-full sm:w-48 h-48 bg-brand-gray-900 flex-shrink-0">
                    {drop.coverImage ? (
                      <Image src={drop.coverImage} alt={drop.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-4xl text-brand-gray-700 uppercase tracking-widest">
                          {drop.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {isLive && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-brand-gray-500 mb-1">{dateStr}</p>
                      <h2 className="text-xl font-display uppercase tracking-wider group-hover:text-brand-gray-300 transition-colors">
                        {drop.name}
                      </h2>
                      {drop.description && (
                        <p className="text-sm text-brand-gray-400 mt-2 leading-relaxed line-clamp-2">{drop.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-brand-gray-500">
                        {drop._count.waitlist} orang mendaftar
                      </p>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-gray-300 group-hover:text-white transition-colors">
                        {isLive ? "Belanja Sekarang →" : "Daftar Waitlist →"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Past drops */}
        {pastDrops.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-gray-600 mb-4">Drop Sebelumnya</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pastDrops.map((drop) => (
                <div key={drop.id} className="border border-brand-gray-800 p-4 opacity-40">
                  <p className="text-xs font-bold uppercase tracking-wider line-clamp-1">{drop.name}</p>
                  <p className="text-[10px] text-brand-gray-500 mt-1">
                    {new Date(drop.releaseDate).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[10px] text-brand-gray-600 mt-0.5 uppercase tracking-wider">Berakhir</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

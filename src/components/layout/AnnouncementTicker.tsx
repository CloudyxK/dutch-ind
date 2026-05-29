import prisma from "@/lib/prisma";

// Default ticker items (used as fallback when no DB setting exists)
const DEFAULT_TICKER_ITEMS = [
  "NEW COLLECTION AVAILABLE",
  "GRATIS ONGKIR BELANJA DI ATAS RP500.000",
  "GUNAKAN KODE WELCOME10 UNTUK DISKON 10%",
  "TOKO BRAND LOKAL TERMURAH NO #1",
  "PENGIRIMAN KE SELURUH INDONESIA",
  "MEMBER DIAMOND GRATIS SEMUA ONGKIR",
  "KUALITAS PREMIUM · STREETWEAR LOKAL",
];

const SEP = "  ✦  ";

export default async function AnnouncementTicker() {
  // Fetch ticker setting from DB
  let tickerItems = DEFAULT_TICKER_ITEMS;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "announcement_ticker" },
    });

    if (setting?.value) {
      const parsed = setting.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (parsed.length > 0) {
        tickerItems = parsed;
      }
    }
  } catch {
    // Fall back to defaults on DB error
  }

  // Duplikat untuk seamless loop
  const text = [...tickerItems, ...tickerItems].join(SEP) + SEP;

  return (
    <div className="relative overflow-hidden bg-white text-black py-2 border-b border-white/10">
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #fff, transparent)" }} />

      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: "tickerScroll 35s linear infinite",
        }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] pr-4">
          {text}
        </span>
        {/* Second copy for seamless loop */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] pr-4" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}

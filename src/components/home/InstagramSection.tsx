import prisma from "@/lib/prisma";
import Link from "next/link";
import { Instagram } from "lucide-react";

async function getInstagramConfig(): Promise<{ handle: string; images: string[] }> {
  const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80",
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&q=80",
    "https://images.unsplash.com/photo-1583744946564-b52d4c252a08?w=400&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
    "https://images.unsplash.com/photo-1617952385804-7b326fa42c59?w=400&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
  ];

  try {
    const [contactSetting, feedSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "contact.config" } }),
      prisma.setting.findUnique({ where: { key: "instagram.feed" } }),
    ]);

    const handle = (() => {
      if (contactSetting?.value) {
        const config = JSON.parse(contactSetting.value);
        return config.instagram || "dutch.ind";
      }
      return "dutch.ind";
    })();

    const images = (() => {
      if (feedSetting?.value) {
        const parsed = JSON.parse(feedSetting.value);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
      }
      return DEFAULT_IMAGES;
    })();

    return { handle, images };
  } catch {
    return { handle: "dutch.ind", images: DEFAULT_IMAGES };
  }
}

export default async function InstagramSection() {
  const { handle, images } = await getInstagramConfig();
  const igUrl = `https://www.instagram.com/${handle}/`;

  return (
    <section className="py-16 border-t border-brand-gray-800">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gray-500 mb-1">Ikuti Kami</p>
            <h2 className="text-2xl font-display tracking-wider uppercase flex items-center gap-3">
              <Instagram className="w-5 h-5" /> @{handle}
            </h2>
          </div>
          <a href={igUrl} target="_blank" rel="noopener noreferrer"
             className="text-xs border border-brand-gray-600 hover:border-white px-4 py-2 transition-colors uppercase tracking-widest">
            Buka Instagram
          </a>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
          {images.slice(0, 6).map((src, i) => (
            <a key={i} href={igUrl} target="_blank" rel="noopener noreferrer"
               className="group relative aspect-square overflow-hidden bg-brand-gray-800 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Instagram post ${i + 1}`}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

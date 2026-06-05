import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ─── Price estimates per category (grosir/wholesale IDR) ─────────────────────
const PRICE_ESTIMATES: Record<string, { min: number; max: number; unit: string }> = {
  hoodie:    { min: 45_000,  max: 120_000, unit: "per pcs" },
  kaos:      { min: 15_000,  max: 55_000,  unit: "per pcs" },
  celana:    { min: 35_000,  max: 90_000,  unit: "per pcs" },
  jacket:    { min: 75_000,  max: 180_000, unit: "per pcs" },
  aksesori:  { min: 5_000,   max: 35_000,  unit: "per pcs" },
  topi:      { min: 12_000,  max: 40_000,  unit: "per pcs" },
  tas:       { min: 25_000,  max: 85_000,  unit: "per pcs" },
  sepatu:    { min: 60_000,  max: 150_000, unit: "per pcs" },
  general:   { min: 20_000,  max: 100_000, unit: "per pcs" },
};

// ─── Smart keyword expansion (AI-like, no external API needed) ────────────────
function generateKeywords(query: string, category: string): string[] {
  const base = query.trim().toLowerCase();
  const cat  = category.toLowerCase();

  const wholesale  = ["grosir", "wholesale", "konveksi", "pabrik", "supplier", "distributor"];
  const quality    = ["premium", "bahan tebal", "oversize", "distro", "streetwear"];
  const location   = ["Bandung", "Tanah Abang", "Surabaya", "Yogyakarta", "Solo"];
  const moq        = ["per kodi", "per lusin", "min 12 pcs", "ecer boleh", "satuan"];

  const keywords: string[] = [
    base,
    `${base} grosir murah`,
    `${base} wholesale`,
    `${base} konveksi`,
    `supplier ${base} murah`,
    `${base} ${quality[Math.floor(Math.random() * quality.length)]}`,
    `grosir ${cat} murah`,
    `konveksi ${cat} Bandung`,
    `${cat} streetwear grosir`,
    `${base} per kodi`,
    `supplier baju ${cat}`,
    `pabrik ${cat} murah`,
  ];

  // Remove duplicates & limit
  return [...new Set(keywords)].slice(0, 8);
}

// ─── Build marketplace search URLs ───────────────────────────────────────────
function buildSearchLinks(keyword: string) {
  const enc = encodeURIComponent(keyword);
  return {
    shopee:    `https://shopee.co.id/search?keyword=${enc}&sortBy=price&order=asc&is_official_shop=false`,
    tokopedia: `https://www.tokopedia.com/search?st=product&q=${enc}&source=universe&ob=3&page=1`,
    lazada:    `https://www.lazada.co.id/catalog/?q=${enc}&sort=priceasc`,
    facebook:  `https://www.facebook.com/marketplace/category/clothing/?query=${enc}`,
    tiktok:    `https://www.tiktok.com/search?q=${enc}&type=product`,
    blibli:    `https://www.blibli.com/jual/${enc.replace(/%20/g, '-')}?sort=7`,
  };
}

// ─── Optional: Call Claude AI if ANTHROPIC_API_KEY is set ─────────────────────
async function callAI(query: string, category: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-20240307",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Kamu adalah asisten sourcing untuk brand streetwear Indonesia bernama DUTCH.IND di Samarinda.

Admin mencari stok grosir: "${query}" (kategori: ${category})

Berikan dalam Bahasa Indonesia:
1. 3 tips mencari supplier terpercaya untuk item ini
2. Ciri-ciri supplier penipu yang harus dihindari
3. Kisaran harga grosir wajar di pasar Indonesia
4. Platform terbaik untuk mencari jenis barang ini

Format singkat dan praktis, maksimal 150 kata.`
        }]
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ─── POST /api/admin/stock-finder/search ─────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { query, category = "general" } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "Kata kunci wajib diisi" }, { status: 400 });
    }

    const cleanQuery = String(query).trim().slice(0, 100);
    const cleanCat   = String(category).trim().toLowerCase();

    // Generate keywords + links
    const keywords = generateKeywords(cleanQuery, cleanCat);
    const estimate = PRICE_ESTIMATES[cleanCat] ?? PRICE_ESTIMATES.general;

    // Build results per keyword × platform
    const results = keywords.map((kw) => ({
      keyword: kw,
      links:   buildSearchLinks(kw),
    }));

    // AI insight (optional)
    const aiNotes = await callAI(cleanQuery, cleanCat);

    // Save search history
    await prisma.stockSearch.create({
      data: {
        query:    cleanQuery,
        category: cleanCat,
        results:  JSON.stringify(results.slice(0, 4)),
        aiNotes:  aiNotes ?? undefined,
      },
    }).catch(() => {}); // non-blocking

    return NextResponse.json({
      success: true,
      data: {
        query:    cleanQuery,
        category: cleanCat,
        estimate,
        keywords,
        results,
        aiNotes,
        platforms: Object.keys(buildSearchLinks("")),
      },
    });
  } catch (error) {
    console.error("[stock-finder search]", error);
    return NextResponse.json({ error: "Gagal melakukan pencarian" }, { status: 500 });
  }
}

// ─── GET /api/admin/stock-finder/search — history ────────────────────────────
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const history = await prisma.stockSearch.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, query: true, category: true, createdAt: true, aiNotes: true },
    });

    return NextResponse.json({ data: history });
  } catch {
    return NextResponse.json({ error: "Gagal memuat histori" }, { status: 500 });
  }
}

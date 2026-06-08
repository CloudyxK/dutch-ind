import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ─── Canonical product type ───────────────────────────────────────────────────

export interface ProductResult {
  id:             string;
  name:           string;
  price:          number;          // in IDR
  priceFormatted: string;
  priceOriginal:  number | null;   // compare price (before discount)
  image:          string;
  url:            string;
  rating:         number | null;
  ratingCount:    number | null;
  sold:           string | null;
  shop:           string | null;
  platform:       "shopee" | "tokopedia";
  location:       string | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

// ─── Shopee ───────────────────────────────────────────────────────────────────
// Shopee stores prices as IDR × 100000 internally.

const SHOPEE_PRICE_UNIT = 100_000;

async function searchShopee(
  query: string,
  priceMin?: number,
  priceMax?: number,
): Promise<ProductResult[]> {
  const params = new URLSearchParams({
    by:           "relevancy",
    keyword:      query,
    limit:        "20",
    newest:       "0",
    order:        "desc",
    page_type:    "search",
    scenario:     "PAGE_GLOBAL_SEARCH",
    version:      "2",
  });
  if (priceMin) params.set("price_min", String(priceMin * SHOPEE_PRICE_UNIT));
  if (priceMax) params.set("price_max", String(priceMax * SHOPEE_PRICE_UNIT));

  const res = await fetch(
    `https://shopee.co.id/api/v4/search/search_items?${params}`,
    {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":          "application/json",
        "Accept-Language": "id-ID,id;q=0.9",
        "Referer":         "https://shopee.co.id/",
        "X-API-Source":    "pc",
        "X-Shopee-Language": "id",
      },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!res.ok) throw new Error(`Shopee API ${res.status}`);

  const data = await res.json();
  const items: any[] = data?.items ?? [];

  return items
    .map((item: any): ProductResult | null => {
      const b = item.item_basic ?? item;
      if (!b?.itemid || !b?.shopid) return null;

      const priceRaw    = b.price_min ?? b.price ?? 0;
      const priceIdr    = Math.round(priceRaw / SHOPEE_PRICE_UNIT);
      const origRaw     = b.price_before_discount ?? null;
      const origIdr     = origRaw ? Math.round(origRaw / SHOPEE_PRICE_UNIT) : null;
      const imageHash   = b.image ?? b.images?.[0] ?? "";
      const imageUrl    = imageHash
        ? `https://cf.shopee.co.id/file/${imageHash}_tn`
        : "";

      return {
        id:             `shopee-${b.itemid}`,
        name:           String(b.name ?? ""),
        price:          priceIdr,
        priceFormatted: fmt(priceIdr),
        priceOriginal:  origIdr && origIdr > priceIdr ? origIdr : null,
        image:          imageUrl,
        url:            `https://shopee.co.id/product/${b.shopid}/${b.itemid}`,
        rating:         b.item_rating?.rating_star ?? null,
        ratingCount:    b.item_rating?.rating_count?.[0] ?? null,
        sold:           b.sold != null ? `${b.sold} terjual` : null,
        shop:           b.shop_name ?? null,
        platform:       "shopee",
        location:       b.shop_location ?? null,
      };
    })
    .filter((p): p is ProductResult => p !== null && p.price > 0 && p.name.length > 0);
}

// ─── Tokopedia ────────────────────────────────────────────────────────────────
// ace.tokopedia.com returns prices in plain IDR.

async function searchTokopedia(
  query: string,
  priceMin?: number,
  priceMax?: number,
): Promise<ProductResult[]> {
  const params = new URLSearchParams({
    q:      query,
    rows:   "20",
    start:  "0",
    device: "desktop",
    source: "universe",
    ob:     "23",   // sort by relevance
  });
  if (priceMin) params.set("pmin", String(priceMin));
  if (priceMax) params.set("pmax", String(priceMax));

  const res = await fetch(
    `https://ace.tokopedia.com/search/product/v3?${params}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":     "application/json",
        "Referer":    "https://www.tokopedia.com/",
        "Origin":     "https://www.tokopedia.com",
      },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!res.ok) throw new Error(`Tokopedia API ${res.status}`);

  const data = await res.json();
  const products: any[] = data?.data?.products ?? [];

  return products
    .map((p: any): ProductResult | null => {
      if (!p?.id || !p?.name) return null;
      const priceIdr = p.priceInt ?? 0;

      return {
        id:             `tokopedia-${p.id}`,
        name:           String(p.name ?? ""),
        price:          priceIdr,
        priceFormatted: p.price ?? fmt(priceIdr),
        priceOriginal:  null,
        image:          p.imageUrl ?? "",
        url:            p.url ?? `https://www.tokopedia.com/search?q=${encodeURIComponent(p.name)}`,
        rating:         p.rating ? parseFloat(p.rating) : null,
        ratingCount:    p.reviewCount ?? null,
        sold:           p.sold ?? null,
        shop:           p.shop?.name ?? null,
        platform:       "tokopedia",
        location:       p.shop?.city ?? null,
      };
    })
    .filter((p): p is ProductResult => p !== null && p.price > 0);
}

// ─── GET /api/admin/stock-finder/products ─────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sp       = request.nextUrl.searchParams;
    const query    = (sp.get("q") ?? "").trim();
    const priceMin = sp.get("priceMin") ? Number(sp.get("priceMin")) : undefined;
    const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : undefined;
    const platforms = (sp.get("platforms") ?? "shopee,tokopedia").split(",").map(s => s.trim());

    if (!query) {
      return NextResponse.json({ error: "Kata kunci wajib diisi" }, { status: 400 });
    }

    const tasks: Promise<{ platform: string; products: ProductResult[]; error: string | null }>[] = [];

    if (platforms.includes("shopee")) {
      tasks.push(
        searchShopee(query, priceMin, priceMax)
          .then(products => ({ platform: "shopee", products, error: null }))
          .catch(e  => ({ platform: "shopee", products: [], error: String(e.message) })),
      );
    }

    if (platforms.includes("tokopedia")) {
      tasks.push(
        searchTokopedia(query, priceMin, priceMax)
          .then(products => ({ platform: "tokopedia", products, error: null }))
          .catch(e  => ({ platform: "tokopedia", products: [], error: String(e.message) })),
      );
    }

    const results = await Promise.all(tasks);

    // Merge + sort by price ascending
    const allProducts = results.flatMap(r => r.products);
    allProducts.sort((a, b) => a.price - b.price);

    // Client-side price filtering safety net (in case API filter wasn't honoured)
    const filtered = allProducts.filter(p => {
      if (priceMin && p.price < priceMin) return false;
      if (priceMax && p.price > priceMax) return false;
      return true;
    });

    const errors = results
      .filter(r => r.error)
      .map(r => `${r.platform}: ${r.error}`);

    return NextResponse.json({
      success: true,
      data: {
        query,
        priceMin,
        priceMax,
        count:    filtered.length,
        products: filtered,
        errors:   errors.length ? errors : undefined,
        platformStatus: Object.fromEntries(
          results.map(r => [r.platform, { count: r.products.length, error: r.error }])
        ),
      },
    });
  } catch (error) {
    console.error("[stock-finder/products]", error);
    return NextResponse.json({ error: "Gagal mencari produk" }, { status: 500 });
  }
}

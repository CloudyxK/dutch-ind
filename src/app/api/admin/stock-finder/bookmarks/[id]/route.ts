import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

const SHOPEE_PRICE_UNIT = 100_000;

// ─── Shopee: fetch current price via item detail API ──────────────────────────
async function fetchShopeePrice(platformId: string): Promise<number | null> {
  try {
    const [shopid, itemid] = platformId.split("_");
    if (!shopid || !itemid) return null;

    const res = await fetch(
      `https://shopee.co.id/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer":    "https://shopee.co.id/",
          "Accept":     "application/json",
        },
        signal: AbortSignal.timeout(6_000),
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.data;
    const raw  = item?.price_min ?? item?.price ?? null;
    return raw ? Math.round(raw / SHOPEE_PRICE_UNIT) : null;
  } catch {
    return null;
  }
}

// ─── Tokopedia: fetch current price via search (no stable detail API) ─────────
async function fetchTokopediaPrice(name: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://ace.tokopedia.com/search/product/v3?q=${encodeURIComponent(name)}&rows=1&start=0&device=desktop&source=universe`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer":    "https://www.tokopedia.com/",
          "Accept":     "application/json",
        },
        signal: AbortSignal.timeout(6_000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.products?.[0]?.priceInt ?? null;
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ id: string }> };

// ─── PATCH — update notes ──────────────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { notes, isTracking } = body;

    const updated = await prisma.bookmarkedProduct.update({
      where: { id },
      data: {
        ...(notes     !== undefined && { notes:      String(notes) }),
        ...(isTracking !== undefined && { isTracking: Boolean(isTracking) }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// ─── DELETE — remove bookmark ─────────────────────────────────────────────────
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.bookmarkedProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}

// ─── POST /bookmarks/[id] — re-check current price ───────────────────────────
export async function POST(_: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const bookmark = await prisma.bookmarkedProduct.findUnique({ where: { id } });
    if (!bookmark) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    // Fetch current price
    let newPrice: number | null = null;
    if (bookmark.platform === "shopee") {
      newPrice = await fetchShopeePrice(bookmark.platformId);
    } else if (bookmark.platform === "tokopedia") {
      newPrice = await fetchTokopediaPrice(bookmark.name);
    }

    if (!newPrice) {
      return NextResponse.json({ error: "Tidak bisa mengambil harga terbaru" }, { status: 502 });
    }

    // Append to price history
    const history: { price: number; checkedAt: string }[] = (() => {
      try { return JSON.parse(bookmark.priceHistory); } catch { return []; }
    })();
    history.push({ price: newPrice, checkedAt: new Date().toISOString() });
    // Keep last 30 entries
    if (history.length > 30) history.splice(0, history.length - 30);

    const updated = await prisma.bookmarkedProduct.update({
      where: { id },
      data: {
        lastPrice:    newPrice,
        priceHistory: JSON.stringify(history),
      },
    });

    const change = newPrice - bookmark.lastPrice;
    const changePct = bookmark.lastPrice > 0
      ? Math.round((change / bookmark.lastPrice) * 100)
      : 0;

    return NextResponse.json({
      data: updated,
      meta: { prevPrice: bookmark.lastPrice, newPrice, change, changePct },
    });
  } catch {
    return NextResponse.json({ error: "Gagal cek harga" }, { status: 500 });
  }
}

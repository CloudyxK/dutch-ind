import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchTracking, carrierCodeFromMethod, CarrierCode } from "@/lib/tracking";

/** Customer-facing tracking endpoint — reads cached data first, refreshes on demand */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const isAdmin = (session.user as any)?.role === "ADMIN";

    const order = await prisma.order.findFirst({
      where: { id, ...(!isAdmin && { userId: session.user.id }) },
      select: {
        id: true,
        trackingNumber: true,
        trackingCarrier: true,
        shippingMethod: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (!order.trackingNumber) {
      return NextResponse.json({ error: "Nomor resi belum tersedia" }, { status: 400 });
    }

    // Try cached tracking data first
    const cached = await prisma.setting.findUnique({
      where: { key: `tracking:${id}` },
    });

    if (cached) {
      try {
        const data = JSON.parse(cached.value);
        return NextResponse.json({
          success: true,
          cached: true,
          updatedAt: cached.updatedAt,
          data,
        });
      } catch {
        // Invalid cache, fall through to live fetch
      }
    }

    // No cache — live fetch
    const carrier = (order.trackingCarrier ||
      carrierCodeFromMethod(order.shippingMethod)) as CarrierCode | null;

    if (!carrier) {
      return NextResponse.json({ error: "Ekspedisi tidak dikenali" }, { status: 400 });
    }

    const tracking = await fetchTracking(carrier, order.trackingNumber);

    // Cache result
    if (tracking.success) {
      await prisma.setting.upsert({
        where: { key: `tracking:${id}` },
        create: { key: `tracking:${id}`, value: JSON.stringify(tracking) },
        update: { value: JSON.stringify(tracking) },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      cached: false,
      updatedAt: new Date(),
      data: tracking,
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data tracking" }, { status: 500 });
  }
}

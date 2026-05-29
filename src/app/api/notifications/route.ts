import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Statuses that indicate an order has been actively processed
// (anything other than the initial AWAITING_PAYMENT / PENDING state)
const ACTIVE_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const settingKey = `notif_last_seen_${userId}`;

    // Fetch the user's last-seen timestamp from Settings
    const setting = await prisma.setting.findUnique({ where: { key: settingKey } });
    const lastSeen = setting ? new Date(setting.value) : null;

    // Look-back window: 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const since = lastSeen && lastSeen > sevenDaysAgo ? lastSeen : sevenDaysAgo;

    // Orders belonging to this user that:
    //  - have an active (processed) status
    //  - were updated after the look-back boundary
    //  - were updated at least 5 minutes after they were created
    //    (so the initial write doesn't count as an "update")
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
        updatedAt: { gt: since },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Filter out orders where updatedAt is within 5 minutes of createdAt
    // to avoid surfacing the initial "PROCESSING" write for COD orders
    const notifications = orders.filter((o) => {
      const diffMs = o.updatedAt.getTime() - o.createdAt.getTime();
      return diffMs > 5 * 60 * 1000;
    });

    return NextResponse.json({
      count: notifications.length,
      notifications: notifications.map((o) => ({
        orderId: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        updatedAt: o.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil notifikasi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const settingKey = `notif_last_seen_${userId}`;

    // Upsert the last-seen timestamp to now
    await prisma.setting.upsert({
      where: { key: settingKey },
      update: { value: new Date().toISOString() },
      create: { key: settingKey, value: new Date().toISOString() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

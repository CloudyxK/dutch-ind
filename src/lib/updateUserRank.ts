import prisma from "@/lib/prisma";
import { calcRank } from "@/lib/rank";

/**
 * Dipanggil setiap kali pesanan berhasil (payment confirmed / COD done).
 * Update totalSpend, orderCount, dan rank user.
 */
export async function updateUserRankAfterOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, total: true },
    });
    if (!order) return;

    const user = await prisma.user.findUnique({
      where:  { id: order.userId },
      select: { totalSpend: true, orderCount: true },
    });
    if (!user) return;

    const newSpend = (user.totalSpend || 0) + order.total;
    const newCount = (user.orderCount || 0) + 1;
    const newRank  = calcRank(newSpend);

    await prisma.user.update({
      where: { id: order.userId },
      data: {
        totalSpend: newSpend,
        orderCount: newCount,
        rank:       newRank,
      },
    });
  } catch (e) {
    console.error("[updateUserRank] error:", e);
  }
}

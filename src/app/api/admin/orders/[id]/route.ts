import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchTracking, mapToOrderStatus, carrierCodeFromMethod, CarrierCode } from "@/lib/tracking";
import { sendShippingEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, trackingCarrier, notes } = body;

    // Build base update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (trackingCarrier !== undefined) updateData.trackingCarrier = trackingCarrier;
    if (notes !== undefined) updateData.notes = String(notes).slice(0, 500);

    // If a tracking number is being saved, auto-check tracking and update status
    if (trackingNumber && trackingNumber.trim()) {
      const order = await prisma.order.findUnique({ where: { id } });
      const carrier = (trackingCarrier || order?.trackingCarrier ||
        carrierCodeFromMethod(order?.shippingMethod)) as CarrierCode | null;

      if (carrier) {
        const tracking = await fetchTracking(carrier, trackingNumber.trim());

        if (tracking.success && !tracking.noApi && tracking.status) {
          const derivedStatus = mapToOrderStatus(tracking.status);
          // Only advance status, never go backward
          const currentOrder = order;
          const statusOrder = ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
          const currentIdx = statusOrder.indexOf(currentOrder?.status ?? "");
          const newIdx = statusOrder.indexOf(derivedStatus ?? "");
          if (derivedStatus && newIdx > currentIdx) {
            updateData.status = derivedStatus;
          } else if (!updateData.status) {
            updateData.status = "SHIPPED";
          }
        } else if (!updateData.status) {
          updateData.status = "SHIPPED";
        }

        // Cache latest tracking data in Setting table
        if (tracking.success) {
          await prisma.setting.upsert({
            where: { key: `tracking:${id}` },
            create: { key: `tracking:${id}`, value: JSON.stringify(tracking) },
            update: { value: JSON.stringify(tracking) },
          }).catch(() => {});
        }
      } else if (!updateData.status) {
        updateData.status = "SHIPPED";
      }
    }

    const order = await prisma.order.update({ where: { id }, data: updateData });

    // Kirim email notifikasi jika status berubah ke SHIPPED
    if (updateData.status === "SHIPPED" || (trackingNumber && order.status === "SHIPPED")) {
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id },
          include: { user: { select: { email: true, name: true } } },
        });
        if (fullOrder?.user?.email && fullOrder.trackingNumber) {
          await sendShippingEmail(fullOrder.user.email, {
            recipientName:  fullOrder.user.name ?? "Pelanggan",
            orderNumber:    fullOrder.orderNumber,
            trackingNumber: fullOrder.trackingNumber,
            shippingMethod: fullOrder.shippingMethod ?? "Kurir",
          });
        }
      } catch { /* email gagal tidak boleh block response */ }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Delete related records first (cascade manually)
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.payment.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pesanan" }, { status: 500 });
  }
}

/** Manual tracking refresh — called from admin or order detail page */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id, ...(!isAdmin && { userId: session?.user?.id }) },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    if (!order.trackingNumber) return NextResponse.json({ error: "Belum ada nomor resi" }, { status: 400 });

    const carrier = (order.trackingCarrier ||
      carrierCodeFromMethod(order.shippingMethod)) as CarrierCode | null;

    if (!carrier) {
      return NextResponse.json({ error: "Ekspedisi tidak dikenali" }, { status: 400 });
    }

    const tracking = await fetchTracking(carrier, order.trackingNumber);

    if (tracking.success && !tracking.noApi && tracking.status) {
      const derivedStatus = mapToOrderStatus(tracking.status);
      const statusOrder = ["AWAITING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
      const currentIdx = statusOrder.indexOf(order.status);
      const newIdx = statusOrder.indexOf(derivedStatus ?? "");
      if (derivedStatus && newIdx > currentIdx) {
        await prisma.order.update({ where: { id }, data: { status: derivedStatus } });
        tracking.status = derivedStatus; // reflect update in response
      }
    }

    // Cache
    if (tracking.success) {
      await prisma.setting.upsert({
        where: { key: `tracking:${id}` },
        create: { key: `tracking:${id}`, value: JSON.stringify(tracking) },
        update: { value: JSON.stringify(tracking) },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: tracking });
  } catch {
    return NextResponse.json({ error: "Gagal cek tracking" }, { status: 500 });
  }
}

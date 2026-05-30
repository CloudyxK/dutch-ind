import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendAdminPaymentProofEmail } from "@/lib/email";

const MANUAL_METHODS = ["MANUAL", "TRANSFER", "QRIS", "EWALLET"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

    const { id } = await params;
    const { imageBase64 } = await request.json();

    if (!imageBase64 || typeof imageBase64 !== "string")
      return NextResponse.json({ error: "Gambar bukti wajib diunggah" }, { status: 400 });

    // Validate image size (max ~2MB as base64 ≈ 1.5MB actual)
    if (imageBase64.length > 2_800_000)
      return NextResponse.json({ error: "Ukuran gambar terlalu besar (maks 2MB)" }, { status: 400 });

    // Validate it's a data URL
    if (!imageBase64.startsWith("data:image/"))
      return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      include: {
        payment: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    if (!order.payment) return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
    if (!MANUAL_METHODS.includes(order.payment.method))
      return NextResponse.json({ error: "Pesanan ini tidak menggunakan transfer manual" }, { status: 400 });
    if (order.payment.status === "SUCCESS")
      return NextResponse.json({ error: "Pembayaran sudah dikonfirmasi" }, { status: 400 });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        proofImageUrl:   imageBase64,
        proofUploadedAt: new Date(),
        status:          "WAITING_CONFIRMATION",
        rejectedReason:  null,
      },
    });

    // Kirim notifikasi email ke admin (fire-and-forget)
    sendAdminPaymentProofEmail({
      orderNumber:   order.orderNumber,
      buyerName:     order.user?.name ?? "Pelanggan",
      buyerEmail:    order.user?.email ?? "",
      amount:        order.payment.amount,
      paymentMethod: order.payment.method,
      orderId:       order.id,
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Manual pay error:", error);
    return NextResponse.json({ error: "Gagal mengunggah bukti" }, { status: 500 });
  }
}

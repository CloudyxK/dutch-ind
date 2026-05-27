import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

function escapeCSV(val: any): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + "T23:59:59.999Z");
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: { include: { product: { select: { name: true } }, variant: { select: { size: true } } } },
      payment: true,
      coupon: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "No. Pesanan", "Tanggal", "Status", "Nama Pelanggan", "Email", "No. HP",
    "Kota", "Provinsi", "Produk", "Subtotal", "Diskon", "Ongkir", "Total",
    "Metode Bayar", "Status Bayar", "Kupon", "Resi",
  ];

  const rows = orders.map((o) => {
    const items = o.items.map((i) => `${i.product.name} (${i.variant.size}) x${i.quantity}`).join(" | ");
    return [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString("id-ID"),
      o.status,
      o.user.name,
      o.user.email,
      o.address.phone,
      o.address.city,
      o.address.province,
      items,
      o.subtotal,
      o.discountAmount,
      o.shippingCost,
      o.total,
      o.payment?.method ?? "",
      o.payment?.status ?? "",
      o.coupon?.code ?? "",
      o.trackingNumber ?? "",
    ].map(escapeCSV);
  });

  const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const bom = "﻿";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pesanan-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

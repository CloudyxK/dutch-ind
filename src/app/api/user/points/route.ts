import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    return NextResponse.json({ success: true, data: { points: user?.points ?? 0 } });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil poin" }, { status: 500 });
  }
}

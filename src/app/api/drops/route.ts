import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const drops = await prisma.drop.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    orderBy: { releaseDate: "asc" },
  });
  return NextResponse.json({ data: drops });
}

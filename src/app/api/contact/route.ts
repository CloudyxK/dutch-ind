import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: "contact.config" } });
  if (!row) return NextResponse.json({ data: null });
  try { return NextResponse.json({ data: JSON.parse(row.value) }); }
  catch { return NextResponse.json({ data: null }); }
}

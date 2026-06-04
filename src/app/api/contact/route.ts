import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: "contact.config" } });
  const data = row ? (() => { try { return JSON.parse(row.value); } catch { return null; } })() : null;
  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

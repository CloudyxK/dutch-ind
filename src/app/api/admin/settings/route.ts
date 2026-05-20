import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

/** GET /api/admin/settings?keys=a,b,c  — returns { key: value } map */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const keysParam = request.nextUrl.searchParams.get("keys");
  const where = keysParam ? { key: { in: keysParam.split(",") } } : undefined;
  const rows = await prisma.setting.findMany({ where });
  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ success: true, data });
}

/** POST /api/admin/settings  body: { key: value, … } — upserts all entries */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  if (typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body harus berupa object" }, { status: 400 });
  }

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );

  return NextResponse.json({ success: true });
}

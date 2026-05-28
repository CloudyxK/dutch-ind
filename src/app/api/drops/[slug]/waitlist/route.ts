import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySameOrigin, parseJsonSafe, sanitize, isValidEmail } from "@/lib/security";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const parsed = await parseJsonSafe(request, 2_000);
  if (!parsed.ok) return parsed.response;

  const { email, name } = parsed.data;
  if (!email || !isValidEmail(email))
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });

  const drop = await prisma.drop.findUnique({ where: { slug } });
  if (!drop || drop.status === "ENDED")
    return NextResponse.json({ error: "Drop tidak ditemukan atau sudah berakhir" }, { status: 404 });

  await prisma.dropWaitlist.upsert({
    where:  { dropId_email: { dropId: drop.id, email } },
    create: { dropId: drop.id, email, name: name ? sanitize(String(name)).slice(0, 60) : null },
    update: {},
  });

  return NextResponse.json({ success: true });
}

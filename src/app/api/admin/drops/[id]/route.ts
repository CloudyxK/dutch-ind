import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifySameOrigin, parseJsonSafe, sanitize } from "@/lib/security";
import { sendDropLiveEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!verifySameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireAdmin()))   return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = await parseJsonSafe(request, 10_000);
  if (!parsed.ok) return parsed.response;

  const { name, description, coverImage, releaseDate, couponCode, status } = parsed.data;

  const prevDrop = await prisma.drop.findUnique({ where: { id } });
  if (!prevDrop) return NextResponse.json({ error: "Drop tidak ditemukan" }, { status: 404 });

  const updated = await prisma.drop.update({
    where: { id },
    data: {
      ...(name         && { name: sanitize(name).slice(0, 100) }),
      ...(description  !== undefined && { description: description ? sanitize(description).slice(0, 500) : null }),
      ...(coverImage   !== undefined && { coverImage }),
      ...(releaseDate  && { releaseDate: new Date(releaseDate) }),
      ...(couponCode   !== undefined && { couponCode: couponCode ? sanitize(couponCode).toUpperCase().slice(0, 20) : null }),
      ...(status       && { status }),
    },
  });

  // Kirim email ke waitlist ketika status berubah ke LIVE
  if (status === "LIVE" && prevDrop.status !== "LIVE") {
    try {
      const waitlist = await prisma.dropWaitlist.findMany({
        where: { dropId: id },
        select: { email: true, name: true },
      });
      if (waitlist.length > 0) {
        Promise.all(
          waitlist.map((w) =>
            sendDropLiveEmail(w.email, {
              name:      w.name ?? "Kamu",
              dropName:  updated.name,
              dropSlug:  updated.slug,
              couponCode: updated.couponCode ?? undefined,
            })
          )
        ).catch(() => {});
      }
    } catch {}
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!verifySameOrigin(_req))   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await requireAdmin()))   return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.drop.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

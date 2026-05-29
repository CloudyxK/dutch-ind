import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const KEY_PREFIX = "wishlist_share_";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const key = `${KEY_PREFIX}${userId}`;

  // Check if token already exists
  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) return NextResponse.json({ token: existing.value });

  // Generate new token
  const token = randomBytes(16).toString("hex");
  await prisma.setting.create({ data: { key, value: token } });
  return NextResponse.json({ token });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = `${KEY_PREFIX}${session.user.id}`;
  await prisma.setting.deleteMany({ where: { key } });
  return NextResponse.json({ success: true });
}

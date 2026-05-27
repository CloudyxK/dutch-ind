import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveSubscription, removeSubscription } from "@/lib/webpush";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const sub = await request.json();
  await saveSubscription(sub);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { endpoint } = await request.json();
  await removeSubscription(endpoint);
  return NextResponse.json({ success: true });
}

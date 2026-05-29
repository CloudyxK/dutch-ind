import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUserSubscription, removeUserSubscription } from "@/lib/webpush";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await request.json();
  await saveUserSubscription(session.user.id, sub);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { endpoint } = await request.json();
  await removeUserSubscription(session.user.id, endpoint);
  return NextResponse.json({ success: true });
}

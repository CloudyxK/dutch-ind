import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { imageBase64 } = body ?? {};
  if (!imageBase64 || typeof imageBase64 !== "string")
    return NextResponse.json({ error: "imageBase64 wajib diisi" }, { status: 400 });
  if (!imageBase64.startsWith("data:image/"))
    return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
  if (imageBase64.length > 400_000)
    return NextResponse.json({ error: "Gambar terlalu besar (maks ~300KB)" }, { status: 400 });

  // Upload ke Cloudinary jika tersedia, fallback ke base64 di DB
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder:         "dutch-ind/avatars",
        public_id:      `avatar_${session.user.id}`,
        overwrite:      true,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      });

      await prisma.user.update({
        where: { id: session.user.id as string },
        data:  { avatar: result.secure_url },
      });

      return NextResponse.json({ success: true, avatar: result.secure_url });
    } catch (e) {
      console.error("[avatar] Cloudinary upload failed, falling back to base64:", e);
    }
  }

  // Fallback: simpan base64 langsung
  await prisma.user.update({
    where: { id: session.user.id as string },
    data:  { avatar: imageBase64 },
  });

  return NextResponse.json({ success: true, avatar: imageBase64 });
}

export async function DELETE(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id as string },
    select: { avatar: true },
  });

  // Hapus dari Cloudinary jika URL cloudinary
  if (user?.avatar && user.avatar.includes("cloudinary.com")) {
    try {
      await cloudinary.uploader.destroy(`dutch-ind/avatars/avatar_${session.user.id}`);
    } catch {}
  }

  await prisma.user.update({
    where: { id: session.user.id as string },
    data:  { avatar: null },
  });

  return NextResponse.json({ success: true });
}

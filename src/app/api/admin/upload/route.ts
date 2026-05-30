import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary belum dikonfigurasi" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Hanya file gambar yang diizinkan" }, { status: 400 });
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 10 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "dutch-ind/products",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("[upload] Cloudinary error:", err);
    const msg = err?.message || err?.error?.message || JSON.stringify(err) || "Unknown error";
    return NextResponse.json({ error: `Upload gagal: ${msg}` }, { status: 500 });
  }
}

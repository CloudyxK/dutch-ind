import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { file, folder = "reviews" } = body;

    if (!file || typeof file !== "string") {
      return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
    }

    // Accept base64 data URL or raw base64
    const dataUrl = file.startsWith("data:") ? file : `data:image/jpeg;base64,${file}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `dutch-ind/${folder}`,
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 });
  }
}

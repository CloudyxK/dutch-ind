import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey     = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret  = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: `Cloudinary env missing: ${[!cloudName && "CLOUD_NAME", !apiKey && "API_KEY", !apiSecret && "API_SECRET"].filter(Boolean).join(", ")}` },
      { status: 500 }
    );
  }

  // Re-configure every request (serverless functions can be cold-started)
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Hanya file gambar" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Maks 10 MB" }, { status: 400 });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder:          "dutch-ind/products",
      resource_type:   "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });

  } catch (err: any) {
    console.error("[upload] Cloudinary error:", JSON.stringify(err));
    const msg = err?.error?.message ?? err?.message ?? String(err);
    return NextResponse.json({ error: `Cloudinary: ${msg}` }, { status: 500 });
  }
}

// GET: return signed upload params so browser can upload directly as fallback
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey    = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = "dutch-ind/products";

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import {
  isValidUploadFolder,
  estimateBase64Size,
  isImageBase64,
  rateLimitResponse,
} from "@/lib/security";
import { uploadLimiter, getIp } from "@/lib/rateLimit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB decoded

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limit: 10 uploads / minute per user ─────────────────────────
    const userId = (session.user as any).id ?? getIp(request);
    const rl = uploadLimiter(`upload:${userId}`);
    if (!rl.success) return rateLimitResponse(rl.retryAfter);

    // ── Parse body with 3MB limit (base64 ~33% larger than binary) ────────
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 3_000_000) {
      return NextResponse.json({ error: "File terlalu besar" }, { status: 413 });
    }

    const text = await request.text();
    if (text.length > 3_000_000) {
      return NextResponse.json({ error: "File terlalu besar" }, { status: 413 });
    }

    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Format request tidak valid" }, { status: 400 });
    }

    const { file, folder = "reviews" } = body;

    // ── Validate folder (prevent path traversal) ───────────────────────────
    if (!isValidUploadFolder(folder)) {
      return NextResponse.json({ error: "Folder tidak valid" }, { status: 400 });
    }

    // ── Validate file ──────────────────────────────────────────────────────
    if (!file || typeof file !== "string") {
      return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
    }

    // Must be a valid image data URL
    if (!isImageBase64(file)) {
      return NextResponse.json({ error: "Hanya gambar (JPEG/PNG/WebP) yang diperbolehkan" }, { status: 400 });
    }

    // Extract base64 part and check decoded size
    const b64 = file.split(",")[1] ?? "";
    if (!b64 || estimateBase64Size(b64) > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Ukuran file maks 2 MB" }, { status: 413 });
    }

    // ── Upload to Cloudinary ──────────────────────────────────────────────
    const result = await cloudinary.uploader.upload(file, {
      folder: `dutch-ind/${folder}`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("[upload]", (error as Error).message);
    return NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 });
  }
}

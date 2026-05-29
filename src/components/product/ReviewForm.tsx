"use client";

import { useState, useRef } from "react";
import { Star, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
};

interface Props {
  productSlug: string;
  userId: string;
  existingReview?: Review | null;
  onReviewAdded: (review: Review) => void;
}

export default function ReviewForm({ productSlug, userId: _userId, existingReview, onReviewAdded }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(!!existingReview);
  const fileRef = useRef<HTMLInputElement>(null);

  if (done) {
    return (
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-1">Ulasan Kamu</p>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={cn("w-4 h-4", s <= (existingReview?.rating ?? rating) ? "fill-white text-white" : "text-brand-gray-600")} />
          ))}
        </div>
        {(existingReview?.comment || comment) && (
          <p className="text-sm text-brand-gray-300">{existingReview?.comment || comment}</p>
        )}
        {existingReview?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={existingReview.imageUrl} alt="Foto review" className="mt-2 rounded w-24 h-24 object-cover" />
        )}
        <p className="text-[10px] text-green-500 mt-2 uppercase tracking-wider">Ulasan berhasil disimpan</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Ukuran file maks 3MB"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setImagePreview(compressed);
        setImageUrl(compressed);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Pilih rating terlebih dahulu"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, imageUrl }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan ulasan"); return; }
      onReviewAdded(json.data);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-brand-gray-900 border border-brand-gray-700 p-5 mt-6">
      <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Tulis Ulasan Kamu</h3>

      {/* Star picker */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={cn(
                "w-7 h-7 transition-colors",
                s <= (hover || rating) ? "fill-white text-white" : "text-brand-gray-600 hover:text-brand-gray-400"
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs text-brand-gray-400 self-center">
            {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][rating]}
          </span>
        )}
      </div>

      <textarea
        className="input-field w-full resize-none"
        rows={3}
        placeholder="Ceritakan pengalaman kamu dengan produk ini... (opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      <div className="flex items-center justify-between mt-1 mb-3">
        <span className="text-xs text-brand-gray-600">{comment.length}/500</span>
      </div>

      {/* Image upload */}
      <div className="mb-4">
        <p className="text-xs text-brand-gray-400 mb-2">Foto Produk (opsional, maks 3MB)</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {imagePreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded border border-brand-gray-700" />
            <button
              type="button"
              onClick={() => { setImagePreview(null); setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-brand-gray-700 hover:border-brand-gray-500 text-xs text-brand-gray-400 hover:text-white transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Tambah Foto
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-sm disabled:opacity-50">
        {loading ? "Menyimpan..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}

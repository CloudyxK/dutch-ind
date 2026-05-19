"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(!!existingReview);

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
        <p className="text-[10px] text-green-500 mt-2 uppercase tracking-wider">Ulasan berhasil disimpan</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Pilih rating terlebih dahulu"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
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

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-sm disabled:opacity-50">
        {loading ? "Menyimpan..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}

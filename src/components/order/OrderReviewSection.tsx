"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewItem = {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  variantSize: string;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "w-7 h-7 transition-all duration-100",
              s <= (hover || value)
                ? "fill-white text-white scale-110"
                : "text-brand-gray-700 hover:text-brand-gray-400"
            )}
          />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-xs text-brand-gray-400 min-w-[80px]">
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const [rating, setRating]   = useState(item.existingReview?.rating ?? 0);
  const [comment, setComment] = useState(item.existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(!!item.existingReview);

  const submit = async () => {
    if (!rating) { setError("Pilih bintang terlebih dahulu"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/products/${item.productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan ulasan"); return; }
      setDone(true);
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 py-5 border-b border-brand-gray-800 last:border-0">
      {/* Product thumbnail */}
      <div className="relative w-14 h-18 flex-shrink-0 bg-brand-gray-800 overflow-hidden"
           style={{ height: "72px" }}>
        {item.productImage ? (
          <Image src={item.productImage} alt={item.productName}
                 fill className="object-cover" sizes="56px"/>
        ) : (
          <div className="w-full h-full bg-brand-gray-800"/>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Product name + size */}
        <p className="font-semibold text-sm leading-tight">{item.productName}</p>
        <p className="text-[10px] text-brand-gray-600 mt-0.5 uppercase tracking-wider">
          Ukuran: {item.variantSize}
        </p>

        {done ? (
          /* ── Already reviewed ── */
          <div className="mt-3">
            <div className="flex gap-0.5 mb-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={cn("w-4 h-4",
                  s <= rating ? "fill-white text-white" : "text-brand-gray-700")} />
              ))}
            </div>
            {comment && (
              <p className="text-xs text-brand-gray-400 leading-relaxed mt-1">{comment}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-3 h-3 text-green-400"/>
              <span className="text-[10px] text-green-400 uppercase tracking-wider">
                Ulasan tersimpan
              </span>
            </div>
          </div>
        ) : (
          /* ── Review form ── */
          <div className="mt-3 space-y-3">
            <StarPicker value={rating} onChange={setRating}/>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalamanmu... (opsional)"
              rows={2}
              maxLength={500}
              className="w-full bg-brand-gray-800 border border-brand-gray-700 text-sm px-3 py-2
                         text-white placeholder:text-brand-gray-600 resize-none
                         focus:outline-none focus:border-brand-gray-500 transition-colors"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={submit}
              disabled={loading || !rating}
              className="px-5 py-1.5 bg-white text-black text-xs font-bold uppercase
                         tracking-widest hover:bg-brand-gray-200 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : "Kirim Ulasan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderReviewSection({ items }: { items: ReviewItem[] }) {
  /* Deduplicate — same product ordered multiple times = 1 review slot */
  const seen  = new Set<string>();
  const deduped = items.filter(({ productId }) => {
    if (seen.has(productId)) return false;
    seen.add(productId);
    return true;
  });

  const allDone = deduped.every((i) => i.existingReview);

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-gray-800 flex items-center gap-2">
        <Star className="w-4 h-4 fill-white text-white"/>
        <h2 className="text-xs font-bold uppercase tracking-widest">
          {allDone ? "Ulasan Kamu" : "Beri Ulasan Produk"}
        </h2>
        {!allDone && (
          <span className="ml-auto text-[9px] text-brand-gray-600 uppercase tracking-wider">
            Bantu pembeli lain
          </span>
        )}
      </div>

      {/* Product list */}
      <div className="px-5">
        {deduped.map((item) => (
          <ReviewCard key={item.productId} item={item}/>
        ))}
      </div>
    </div>
  );
}

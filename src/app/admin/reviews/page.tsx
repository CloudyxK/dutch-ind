"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Check, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, [page]);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?page=${page}`);
    const json = await res.json();
    setReviews(json.data || []);
    setTotal(json.total || 0);
    setPages(json.pages || 1);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) { alert("Gagal menghapus ulasan"); return; }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Ulasan</h1>
        </div>
        <span className="text-xs text-brand-gray-500">{total} total ulasan</span>
      </div>

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Pembeli</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Produk</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Rating</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden lg:table-cell">Komentar</th>
              <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 hidden md:table-cell">Tanggal</th>
              <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-brand-gray-500 text-sm">Memuat...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-brand-gray-500 text-sm">Belum ada ulasan</td></tr>
            ) : reviews.map((review) => (
              <tr key={review.id} className="hover:bg-brand-gray-800/40 transition-colors">
                <td className="p-4">
                  <p className="text-sm text-white font-medium">{review.user.name}</p>
                  <p className="text-xs text-brand-gray-500">{review.user.email}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-brand-gray-300 truncate max-w-[120px]">{review.product.name}</span>
                    <Link href={`/products/${review.product.slug}`} target="_blank" className="text-brand-gray-600 hover:text-white">
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  {review.isVerified && (
                    <span className="text-[10px] text-green-500">✓ Terverifikasi</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-white text-white" : "text-brand-gray-700")} />
                    ))}
                  </div>
                  <span className="text-xs text-brand-gray-500">{review.rating}/5</span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <p className="text-xs text-brand-gray-400 max-w-[200px] truncate">
                    {review.comment || <span className="italic text-brand-gray-600">Tanpa komentar</span>}
                  </p>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-xs text-brand-gray-500">{formatDate(review.createdAt)}</span>
                </td>
                <td className="p-4 text-right">
                  {confirmDeleteId === review.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-brand-gray-400">Hapus?</span>
                      <button onClick={() => handleDelete(review.id)} disabled={deletingId === review.id} className="text-red-400 hover:text-red-300 disabled:opacity-50">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-brand-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(review.id)} className="p-1.5 hover:bg-red-500/10 transition-colors text-brand-gray-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white disabled:opacity-30 transition-colors">
            ← Sebelumnya
          </button>
          <span className="text-xs text-brand-gray-500">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-xs border border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white disabled:opacity-30 transition-colors">
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type ReturnReq = {
  id: string;
  status: string;
  reason: string;
  detail: string | null;
  adminNote: string | null;
  createdAt: string;
  order: { orderNumber: string; total: number };
  user:  { name: string; email: string };
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:  "text-yellow-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  RESOLVED: "text-blue-400",
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("PENDING");

  // Inline action state
  const [actionId, setActionId]     = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [saving, setSaving]         = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/returns?status=${filter}`);
    const data = await res.json();
    setReturns(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED" | "RESOLVED") {
    setSaving(true);
    await fetch("/api/admin/returns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote: actionNote }),
    });
    setActionId(null);
    setActionNote("");
    setSaving(false);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase text-white">Return / Pengembalian</h1>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {["PENDING", "APPROVED", "REJECTED", "RESOLVED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-colors ${
              filter === s
                ? "bg-white text-black border-white"
                : "border-brand-gray-700 text-brand-gray-400 hover:border-white hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gray-500" /></div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 text-brand-gray-500 text-sm">Tidak ada permintaan return dengan status ini.</div>
      ) : (
        <div className="space-y-3">
          {returns.map((req) => (
            <div key={req.id} className="bg-brand-gray-900 border border-brand-gray-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${STATUS_COLOR[req.status] ?? "text-white"}`}>{req.status}</span>
                    <span className="text-brand-gray-600">·</span>
                    <span className="text-sm font-bold">#{req.order.orderNumber}</span>
                    <span className="text-xs text-brand-gray-400">{formatPrice(req.order.total)}</span>
                  </div>
                  <p className="text-xs text-brand-gray-400 mt-0.5">{req.user.name} — {req.user.email}</p>
                </div>
                <p className="text-xs text-brand-gray-500">{new Date(req.createdAt).toLocaleDateString("id-ID")}</p>
              </div>

              <p className="text-sm mb-1"><span className="text-brand-gray-400">Alasan:</span> {req.reason}</p>
              {req.detail && <p className="text-xs text-brand-gray-400 mb-2">{req.detail}</p>}
              {req.adminNote && (
                <p className="text-xs text-brand-gray-300 border-t border-brand-gray-800 pt-2 mt-2">
                  Catatan admin: {req.adminNote}
                </p>
              )}

              {req.status === "PENDING" && (
                <>
                  {actionId === req.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        placeholder="Catatan untuk customer (opsional)..."
                        className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-xs px-3 py-2 resize-none focus:outline-none focus:border-white"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(req.id, "APPROVED")} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-green-900/40 border border-green-700 text-green-400 hover:bg-green-900/60 transition-colors disabled:opacity-50">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Setujui
                        </button>
                        <button onClick={() => handleAction(req.id, "REJECTED")} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50">
                          <X className="w-3 h-3" />
                          Tolak
                        </button>
                        <button onClick={() => setActionId(null)} className="px-3 py-1.5 text-xs text-brand-gray-400 hover:text-white transition-colors">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setActionId(req.id)} className="mt-3 text-xs text-brand-gray-400 hover:text-white transition-colors underline">
                      Review permintaan ini
                    </button>
                  )}
                </>
              )}

              {req.status === "APPROVED" && (
                <button
                  onClick={() => handleAction(req.id, "RESOLVED")}
                  className="mt-3 text-xs px-3 py-1.5 border border-blue-700 text-blue-400 hover:bg-blue-900/20 transition-colors"
                >
                  Tandai Selesai
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

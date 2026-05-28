"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Truck, Check, RefreshCw, ChevronDown, X, Trash2, StickyNote } from "lucide-react";
import { CARRIER_OPTIONS } from "@/lib/tracking";

const STATUS_OPTIONS = [
  { value: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PAID",             label: "Dibayar" },
  { value: "PROCESSING",       label: "Diproses" },
  { value: "SHIPPED",          label: "Dikirim" },
  { value: "DELIVERED",        label: "Terkirim" },
  { value: "COMPLETED",        label: "Selesai" },
  { value: "CANCELLED",        label: "Dibatalkan" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentTrackingCarrier?: string | null;
  currentNotes?: string | null;
}

export default function AdminOrderActions({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentTrackingCarrier,
  currentNotes,
}: Props) {
  const router = useRouter();
  const [updating, setUpdating]   = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showResi, setShowResi] = useState(false);
  const [resi, setResi]         = useState(currentTrackingNumber ?? "");
  const [carrier, setCarrier]   = useState(currentTrackingCarrier ?? "");
  const [checking, setChecking] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [showNote, setShowNote]   = useState(false);
  const [note, setNote]           = useState(currentNotes ?? "");
  const [savingNote, setSavingNote] = useState(false);

  /* ── status dropdown ─────────────────────────────── */
  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status diperbarui");
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  /* ── save resi + auto-track ─────────────────────── */
  const saveResi = async () => {
    if (!resi.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: resi.trim(),
          trackingCarrier: carrier || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      const newStatus = json.data?.status;
      const label = STATUS_OPTIONS.find(s => s.value === newStatus)?.label ?? newStatus;
      toast.success(`Resi disimpan — status: ${label}`);
      setShowResi(false);
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan resi");
    } finally {
      setUpdating(false);
    }
  };

  /* ── manual tracking refresh ─────────────────────── */
  const checkTracking = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal cek tracking"); return; }
      const t = json.data;
      if (t.noApi) {
        toast("Layanan same-day tidak punya tracking API", { icon: "ℹ️" });
        return;
      }
      if (!t.success) { toast.error(t.error || "Resi tidak ditemukan"); return; }
      const statusLabel = STATUS_OPTIONS.find(s => s.value === t.status)?.label ?? t.status;
      setLastStatus(statusLabel ?? t.status);
      toast.success(`Status terbaru: ${statusLabel ?? t.status}`);
      router.refresh();
    } catch {
      toast.error("Gagal cek tracking");
    } finally {
      setChecking(false);
    }
  };

  const deleteOrder = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Pesanan dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus pesanan");
    } finally {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note }),
      });
      if (!res.ok) throw new Error();
      toast.success("Catatan disimpan");
      setShowNote(false);
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan catatan");
    } finally {
      setSavingNote(false);
    }
  };

  const hasResi = !!(currentTrackingNumber || resi);

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      {/* Status select */}
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={updating}
        className="bg-brand-gray-800 border border-brand-gray-600 text-xs px-2 py-1.5 text-white focus:outline-none focus:border-white disabled:opacity-50 w-full"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Resi section */}
      {!showResi ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowResi(true)}
            className="flex-1 flex items-center gap-1 text-[10px] text-brand-gray-400 hover:text-white transition-colors truncate"
          >
            <Truck className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {currentTrackingNumber ? currentTrackingNumber : "Input Nomor Resi"}
            </span>
          </button>

          {/* Live-check button — only when resi exists */}
          {currentTrackingNumber && (
            <button
              onClick={checkTracking}
              disabled={checking}
              title="Cek status tracking terbaru"
              className="text-brand-gray-500 hover:text-white transition-colors flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {/* Carrier picker */}
          <div className="relative">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-brand-gray-800 border border-brand-gray-600 text-[10px] px-2 py-1 text-white focus:outline-none focus:border-white appearance-none pr-5"
            >
              <option value="">— Pilih Ekspedisi —</option>
              {CARRIER_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 text-brand-gray-500 pointer-events-none" />
          </div>

          {/* Resi input */}
          <div className="flex gap-1">
            <input
              value={resi}
              onChange={(e) => setResi(e.target.value)}
              placeholder="Nomor resi..."
              className="bg-brand-gray-800 border border-brand-gray-600 text-[10px] px-2 py-1 text-white focus:outline-none focus:border-white flex-1 min-w-0"
              onKeyDown={(e) => e.key === "Enter" && saveResi()}
            />
            <button
              onClick={saveResi}
              disabled={updating || !resi.trim()}
              title="Simpan & cek tracking"
              className="bg-white text-black px-2 py-1 hover:bg-brand-gray-200 disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowResi(false)}
              className="text-brand-gray-500 hover:text-white px-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Last tracking result */}
      {lastStatus && (
        <p className="text-[9px] text-green-400 truncate">↑ {lastStatus}</p>
      )}

      {/* Carrier badge when resi set */}
      {currentTrackingNumber && currentTrackingCarrier && (
        <p className="text-[9px] text-brand-gray-600 truncate uppercase tracking-wider">
          via {CARRIER_OPTIONS.find(c => c.code === currentTrackingCarrier)?.label ?? currentTrackingCarrier}
        </p>
      )}

      {/* Admin note */}
      {!showNote ? (
        <button
          onClick={() => setShowNote(true)}
          className="flex items-center gap-1 text-[10px] text-brand-gray-500 hover:text-white transition-colors"
        >
          <StickyNote className="w-3 h-3" />
          <span className="truncate">{note ? note.slice(0, 20) + (note.length > 20 ? "…" : "") : "Tambah Catatan"}</span>
        </button>
      ) : (
        <div className="space-y-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Catatan internal..."
            className="w-full bg-brand-gray-800 border border-brand-gray-600 text-[10px] px-2 py-1 text-white focus:outline-none focus:border-white resize-none"
          />
          <div className="flex gap-1">
            <button onClick={saveNote} disabled={savingNote} className="bg-white text-black text-[10px] px-2 py-1 hover:bg-brand-gray-200 disabled:opacity-50">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setShowNote(false)} className="text-brand-gray-500 hover:text-white px-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Delete order */}
      {!confirmDel ? (
        <button
          onClick={() => setConfirmDel(true)}
          className="flex items-center gap-1 text-[10px] text-red-500/60 hover:text-red-400 transition-colors mt-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Hapus Pesanan</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-red-400">Yakin?</span>
          <button
            onClick={deleteOrder}
            disabled={deleting}
            className="text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 transition-colors disabled:opacity-50"
          >
            {deleting ? "..." : "Ya"}
          </button>
          <button
            onClick={() => setConfirmDel(false)}
            className="text-[10px] text-brand-gray-500 hover:text-white px-1 transition-colors"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}

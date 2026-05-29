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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function getWAMessage(orderNumber: string, status: string, buyerName: string): string {
  const base = `Halo ${buyerName}, pesanan kamu *${orderNumber}* dari DUTCH.IND`;
  const messages: Record<string, string> = {
    CONFIRMED:  `${base} telah *dikonfirmasi* dan sedang kami proses. Terima kasih sudah berbelanja! 🙏`,
    PROCESSING: `${base} sedang kami *proses dan siapkan*. Kami akan info lagi saat sudah dikirim.`,
    SHIPPED:    `${base} telah *dikirim* 🚚. Pantau pengiriman di halaman pesananmu.`,
    DELIVERED:  `${base} sudah *sampai*! Jangan lupa kasih ulasan ya 🌟`,
    CANCELLED:  `${base} telah *dibatalkan*. Hubungi kami jika ada pertanyaan.`,
  };
  return messages[status] || `${base} statusnya diperbarui menjadi *${status}*.`;
}

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentTrackingCarrier?: string | null;
  currentNotes?: string | null;
  orderNumber?: string;
  buyerName?: string;
  buyerPhone?: string;
}

export default function AdminOrderActions({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentTrackingCarrier,
  currentNotes,
  orderNumber,
  buyerName,
  buyerPhone,
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

      {/* WA Notification button */}
      {buyerPhone && orderNumber && buyerName && (
        <a
          href={`https://wa.me/${buyerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(getWAMessage(orderNumber, currentStatus, buyerName))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider transition-colors w-full justify-center"
        >
          <WhatsAppIcon className="w-4 h-4" />
          Kirim WA ke Pembeli
        </a>
      )}

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

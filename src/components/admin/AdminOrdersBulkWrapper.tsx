"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckSquare2, Loader2, X, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PAID",             label: "Dibayar" },
  { value: "PROCESSING",       label: "Diproses" },
  { value: "SHIPPED",          label: "Dikirim" },
  { value: "DELIVERED",        label: "Terkirim" },
  { value: "COMPLETED",        label: "Selesai" },
  { value: "CANCELLED",        label: "Dibatalkan" },
];

export default function AdminOrdersBulkWrapper({ orderIds }: { orderIds: string[] }) {
  const router = useRouter();
  const [selected, setSelected]   = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("PROCESSING");
  const [updating, setUpdating]   = useState(false);

  // Listen for checkbox changes in the DOM
  const syncFromDom = useCallback(() => {
    const cbs = document.querySelectorAll<HTMLInputElement>(".order-bulk-cb");
    const ids = Array.from(cbs).filter(c => c.checked).map(c => c.dataset.orderId!);
    setSelected(ids);
  }, []);

  useEffect(() => {
    const container = document.body;
    container.addEventListener("change", syncFromDom);

    // Wire select-all header checkbox
    const selectAllCb = document.getElementById("order-select-all") as HTMLInputElement | null;
    if (selectAllCb) {
      selectAllCb.addEventListener("change", () => {
        document.querySelectorAll<HTMLInputElement>(".order-bulk-cb").forEach(cb => {
          cb.checked = selectAllCb.checked;
        });
        syncFromDom();
      });
    }

    return () => container.removeEventListener("change", syncFromDom);
  }, [syncFromDom]);

  const clearAll = () => {
    document.querySelectorAll<HTMLInputElement>(".order-bulk-cb").forEach(cb => { cb.checked = false; });
    const selectAll = document.getElementById("order-select-all") as HTMLInputElement | null;
    if (selectAll) selectAll.checked = false;
    setSelected([]);
  };

  const applyBulk = async () => {
    const label = STATUS_OPTIONS.find(s => s.value === bulkStatus)?.label;
    if (!confirm(`Update ${selected.length} pesanan menjadi "${label}"?`)) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selected, status: bulkStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.updated} pesanan diperbarui`);
      clearAll();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="sticky top-0 z-30 bg-brand-black border border-white/20 px-4 py-2.5 flex items-center gap-3 flex-wrap shadow-xl mb-4">
          <CheckSquare2 className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-sm font-bold">{selected.length} dipilih</span>
          <div className="relative">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-brand-gray-800 border border-brand-gray-600 text-xs pl-2 pr-6 py-1.5 text-white focus:outline-none focus:border-white appearance-none"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-gray-500" />
          </div>
          <button onClick={applyBulk} disabled={updating}
            className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50">
            {updating && <Loader2 className="w-3 h-3 animate-spin" />}
            Update Status
          </button>
          <button onClick={clearAll} className="text-brand-gray-500 hover:text-white transition-colors ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Select-all row outside table for easy DOM access */}
      <div className="flex items-center gap-2 px-4 py-2 mb-1 text-xs text-brand-gray-500">
        <input
          id="order-select-all"
          type="checkbox"
          className="w-4 h-4 cursor-pointer accent-white"
        />
        <label htmlFor="order-select-all" className="cursor-pointer uppercase tracking-wider select-none">
          Pilih Semua ({orderIds.length})
        </label>
      </div>
    </>
  );
}

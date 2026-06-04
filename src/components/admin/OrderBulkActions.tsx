"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckSquare2, Square, Loader2, X, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PAID",             label: "Dibayar" },
  { value: "PROCESSING",       label: "Diproses" },
  { value: "SHIPPED",          label: "Dikirim" },
  { value: "DELIVERED",        label: "Terkirim" },
  { value: "COMPLETED",        label: "Selesai" },
  { value: "CANCELLED",        label: "Dibatalkan" },
];

export function useBulkSelect(orderIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle    = (id: string) => setSelected(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelected(p => p.size === orderIds.length ? new Set() : new Set(orderIds));
  const clear     = () => setSelected(new Set());
  return { selected, toggle, toggleAll, clear };
}

interface Props {
  selected: Set<string>;
  onClear: () => void;
}

export default function OrderBulkActionBar({ selected, onClear }: Props) {
  const router = useRouter();
  const [bulkStatus, setBulkStatus] = useState("PROCESSING");
  const [updating, setUpdating] = useState(false);

  if (selected.size === 0) return null;

  const applyBulk = async () => {
    const label = STATUS_OPTIONS.find(s => s.value === bulkStatus)?.label;
    if (!confirm(`Update ${selected.size} pesanan menjadi "${label}"?`)) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selected), status: bulkStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.updated} pesanan diperbarui`);
      onClear();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-brand-black border border-white/20 px-4 py-2.5 flex items-center gap-3 flex-wrap shadow-xl mb-2">
      <span className="text-sm font-bold text-white">{selected.size} dipilih</span>
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
        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        Terapkan
      </button>
      <button onClick={onClear} className="text-brand-gray-500 hover:text-white transition-colors ml-auto">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

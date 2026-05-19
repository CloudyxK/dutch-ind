"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Truck, Check } from "lucide-react";

const statusOptions = [
  { value: "AWAITING_PAYMENT", label: "Menunggu Bayar" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Terkirim" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
}

export default function AdminOrderActions({ orderId, currentStatus, currentTrackingNumber }: Props) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [showResi, setShowResi] = useState(false);
  const [resi, setResi] = useState(currentTrackingNumber || "");

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal update");
      toast.success("Status diperbarui");
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  const saveResi = async () => {
    if (!resi.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: resi.trim(), status: "SHIPPED" }),
      });
      if (!res.ok) throw new Error("Gagal simpan");
      toast.success("Nomor resi disimpan & status → Dikirim");
      setShowResi(false);
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan resi");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[160px]">
      <select
        value={currentStatus}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={updating}
        className="bg-brand-gray-800 border border-brand-gray-600 text-xs px-2 py-1.5 text-white focus:outline-none focus:border-white disabled:opacity-50 w-full"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Resi button / input */}
      {!showResi ? (
        <button
          onClick={() => setShowResi(true)}
          className="flex items-center gap-1 text-[10px] text-brand-gray-400 hover:text-white transition-colors"
        >
          <Truck className="w-3 h-3" />
          {currentTrackingNumber ? `Resi: ${currentTrackingNumber}` : "Input Nomor Resi"}
        </button>
      ) : (
        <div className="flex gap-1">
          <input
            value={resi}
            onChange={(e) => setResi(e.target.value)}
            placeholder="Nomor resi..."
            className="bg-brand-gray-800 border border-brand-gray-600 text-xs px-2 py-1 text-white focus:outline-none focus:border-white flex-1 min-w-0"
            onKeyDown={(e) => e.key === "Enter" && saveResi()}
          />
          <button
            onClick={saveResi}
            disabled={updating || !resi.trim()}
            className="bg-white text-black px-2 py-1 text-xs hover:bg-brand-gray-200 disabled:opacity-50"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

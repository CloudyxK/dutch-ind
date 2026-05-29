"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
  count: number;
}

export default function SendNotificationButton({ productId, productName, count }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (count === 0) return;
    const confirmed = window.confirm(
      `Kirim notifikasi restock "${productName}" ke ${count} subscriber?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stock-notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      setSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <span className="text-xs text-green-400 font-medium flex items-center gap-1.5">
        <Bell className="w-3.5 h-3.5" />
        Terkirim
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSend}
        disabled={loading || count === 0}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-brand-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Bell className="w-3 h-3" />
        {loading ? "Mengirim…" : "Kirim Notifikasi"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

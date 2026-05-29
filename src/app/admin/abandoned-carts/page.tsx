"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, Mail, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

type Cart = {
  id: string;
  updatedAt: string;
  user: { name: string; email: string; phone: string };
  items: { product: { name: string; price: number }; variant: { size: string }; quantity: number }[];
};

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/abandoned-carts")
      .then(r => r.json())
      .then(d => setCarts(d.carts || []))
      .finally(() => setLoading(false));
  }, []);

  async function sendReminder(cartId: string, userPhone: string, userName: string) {
    setSending(cartId);
    try {
      await fetch("/api/admin/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      });
      toast.success("Reminder email terkirim!");
    } catch {
      toast.error("Gagal kirim reminder");
    } finally {
      setSending(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-brand-gray-500">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
          <ShoppingBag className="w-6 h-6" /> Abandoned Carts
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">Keranjang yang belum checkout lebih dari 2 jam ({carts.length} keranjang)</p>
      </div>

      {carts.length === 0 ? (
        <p className="text-brand-gray-500 py-12 text-center">Tidak ada abandoned cart saat ini ✓</p>
      ) : (
        <div className="space-y-4">
          {carts.map(cart => {
            const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
            const waMsg = `Halo ${cart.user.name}! Kamu masih ada item di keranjang DUTCH.IND nih. Yuk selesaikan checkoutnya sebelum kehabisan! 🛒 ${process.env.NEXT_PUBLIC_URL || ""}/cart`;
            return (
              <div key={cart.id} className="bg-brand-gray-900 border border-brand-gray-700 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold">{cart.user.name}</p>
                    <p className="text-xs text-brand-gray-400">{cart.user.email}</p>
                    <p className="text-xs text-brand-gray-500 mt-1">
                      Terakhir aktif: {new Date(cart.updatedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-white">{formatPrice(total)}</p>
                </div>
                <div className="text-xs text-brand-gray-400 space-y-1 mb-4">
                  {cart.items.map((item, i) => (
                    <p key={i}>• {item.product.name} ({item.variant.size}) ×{item.quantity}</p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => sendReminder(cart.id, cart.user.phone, cart.user.name)}
                    disabled={sending === cart.id}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-brand-gray-600 hover:border-white transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-3 h-3" />
                    {sending === cart.id ? "Mengirim..." : "Kirim Email Reminder"}
                  </button>
                  {cart.user.phone && (
                    <a
                      href={`https://wa.me/${cart.user.phone.replace(/\D/g,"")}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600/20 border border-green-600/40 hover:bg-green-600/30 text-green-400 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Kirim WA
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

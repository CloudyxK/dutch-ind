import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import AdminManualPaymentActions from "@/components/admin/AdminManualPaymentActions";
import { Banknote, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const METHOD_LABEL: Record<string, string> = {
  TRANSFER: "Transfer Bank",
  QRIS:     "QRIS",
  EWALLET:  "E-Wallet",
  MANUAL:   "Transfer / QRIS",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  WAITING_CONFIRMATION: { label: "⚡ Bukti Masuk",  color: "bg-yellow-900/40 text-yellow-400 border-yellow-700",  icon: Clock },
  MANUAL_PENDING:       { label: "Belum Bayar",    color: "bg-brand-gray-800 text-brand-gray-400 border-brand-gray-700", icon: AlertTriangle },
  REJECTED:             { label: "Ditolak",        color: "bg-red-900/40 text-red-400 border-red-800",           icon: XCircle },
  SUCCESS:              { label: "Lunas",           color: "bg-green-900/40 text-green-400 border-green-800",     icon: CheckCircle2 },
};

export default async function AdminPaymentsPage() {
  const orders = await prisma.order.findMany({
    where: {
      payment: {
        method: { in: ["MANUAL", "TRANSFER", "QRIS", "EWALLET"] },
      },
    },
    include: {
      user:    { select: { name: true, email: true } },
      payment: true,
      address: { select: { phone: true } },
    },
    orderBy: [
      // Bukti masuk selalu di atas
      { payment: { status: "asc" } },
      { createdAt: "desc" },
    ],
  });

  // Hitung ringkasan
  const waiting   = orders.filter(o => o.payment?.status === "WAITING_CONFIRMATION").length;
  const pending   = orders.filter(o => o.payment?.status === "MANUAL_PENDING").length;
  const rejected  = orders.filter(o => o.payment?.status === "REJECTED").length;
  const confirmed = orders.filter(o => o.payment?.status === "SUCCESS").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
        </div>
        <h1 className="text-3xl font-display tracking-widest uppercase text-white flex items-center gap-3">
          <Banknote className="w-7 h-7" /> Pembayaran Manual
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Bukti Masuk",  count: waiting,   color: "text-yellow-400", bg: "border-yellow-800/40 bg-yellow-900/10" },
          { label: "Belum Bayar",  count: pending,   color: "text-brand-gray-400", bg: "border-brand-gray-700 bg-brand-gray-900" },
          { label: "Ditolak",      count: rejected,  color: "text-red-400",    bg: "border-red-900/40 bg-red-900/10" },
          { label: "Lunas",        count: confirmed, color: "text-green-400",  bg: "border-green-900/40 bg-green-900/10" },
        ].map(item => (
          <div key={item.label} className={`border p-4 text-center ${item.bg}`}>
            <p className={`text-3xl font-black font-mono ${item.color}`}>{item.count}</p>
            <p className="text-xs text-brand-gray-500 uppercase tracking-wider mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Pending bukti dulu — jika ada */}
      {waiting > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-400 font-medium">
            Ada <strong>{waiting}</strong> bukti pembayaran yang menunggu konfirmasimu.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              {["No. Pesanan", "Pembeli", "Total", "Metode", "Status", "Tanggal", "Aksi"].map(h => (
                <th key={h} className="text-left p-3 text-xs font-bold uppercase tracking-wider text-brand-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {orders.map(order => {
              const st = STATUS_CONFIG[order.payment?.status ?? ""] ?? {
                label: order.payment?.status ?? "-", color: "bg-brand-gray-800 text-brand-gray-400 border-brand-gray-700", icon: AlertTriangle,
              };
              const isWaiting = order.payment?.status === "WAITING_CONFIRMATION";
              return (
                <tr key={order.id} className={`transition-colors ${isWaiting ? "bg-yellow-500/5 hover:bg-yellow-500/10" : "hover:bg-brand-gray-800/40"}`}>
                  <td className="p-3 font-mono text-sm font-bold">#{order.orderNumber}</td>
                  <td className="p-3">
                    <p className="text-sm">{order.user.name}</p>
                    <p className="text-xs text-brand-gray-500">{order.user.email}</p>
                    {order.address?.phone && (
                      <p className="text-xs text-brand-gray-600 mt-0.5">📞 {order.address.phone}</p>
                    )}
                  </td>
                  <td className="p-3 text-sm font-bold">{formatPrice(order.payment?.amount ?? order.total)}</td>
                  <td className="p-3">
                    <span className="text-xs text-brand-gray-400">
                      {METHOD_LABEL[order.payment?.method ?? ""] ?? order.payment?.method ?? "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 border ${st.color}`}>
                      <st.icon className="w-3 h-3" />
                      {st.label}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-brand-gray-500 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="p-3">
                    {order.payment && (
                      <AdminManualPaymentActions
                        orderId={order.id}
                        proofImageUrl={order.payment.proofImageUrl}
                        paymentStatus={order.payment.status}
                        paymentMethod={order.payment.method}
                        orderStatus={order.status}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-brand-gray-600 text-sm">
                  Belum ada pesanan pembayaran manual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import AdminOrderActions from "@/components/admin/AdminOrderActions";
import AdminManualPaymentActions from "@/components/admin/AdminManualPaymentActions";
import ExportOrdersButton from "@/components/admin/ExportOrdersButton";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      payment: true,
      address: { select: { phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }} className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Pesanan</h1>
        </div>
        <ExportOrdersButton />
      </div>

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              {["No. Pesanan", "Pelanggan", "Produk", "Total", "Pembayaran", "Status", "Tanggal", ""].map(
                (h) => (
                  <th key={h} className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {orders.map((order) => {
              const isManualWaiting =
                ["MANUAL", "TRANSFER", "QRIS", "EWALLET"].includes(order.payment?.method ?? "") &&
                order.payment?.status === "WAITING_CONFIRMATION";
              const isCod = order.payment?.method === "COD";
              const meetMatch = isCod ? order.notes?.match(/\[COD\] Titik pertemuan: (.+?)(\n|$)/) : null;
              const meetingPoint = meetMatch ? meetMatch[1].trim() : null;

              return (
                <tr key={order.id} className={`hover:bg-brand-gray-800/50 transition-colors ${isManualWaiting ? "border-l-2 border-l-yellow-500" : isCod ? "border-l-2 border-l-amber-600" : ""}`}>
                  <td className="p-4 font-mono text-sm font-bold">#{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="text-sm">{order.user.name}</p>
                    <p className="text-xs text-brand-gray-500">{order.user.email}</p>
                    {isCod && order.address?.phone && (
                      <p className="text-xs text-amber-400 mt-0.5">📞 {order.address.phone}</p>
                    )}
                    {isCod && meetingPoint && (
                      <div className="mt-1 bg-amber-900/20 border border-amber-800/40 px-2 py-1">
                        <p className="text-[9px] text-amber-400 uppercase tracking-wider font-bold">Titik Pertemuan</p>
                        <p className="text-xs text-white">{meetingPoint}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-brand-gray-400">{order.items.length} item</td>
                  <td className="p-4 text-sm font-bold">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    {order.payment && (
                      <div className="space-y-1">
                        <span className={`text-xs font-bold px-2 py-1 block w-fit ${
                          order.payment.status === "SUCCESS"              ? "bg-green-900/40 text-green-400"  :
                          order.payment.status === "WAITING_CONFIRMATION" ? "bg-yellow-900/40 text-yellow-400" :
                          order.payment.status === "REJECTED"             ? "bg-red-900/40 text-red-400"      :
                          order.payment.status === "FAILED"               ? "bg-red-900/40 text-red-400"      :
                                                                             "bg-brand-gray-800 text-brand-gray-400"
                        }`}>
                          {order.payment.status === "SUCCESS"              ? "Lunas"               :
                           order.payment.status === "WAITING_CONFIRMATION" ? "⚡ Bukti Masuk"       :
                           order.payment.status === "REJECTED"             ? "Ditolak"              :
                           order.payment.status === "MANUAL_PENDING"       ? "Belum Bayar"          :
                           order.payment.status === "COD_PENDING"          ? "COD — Belum Lunas"    :
                           order.payment.status === "FAILED"               ? "Gagal"                :
                                                                             "Pending"}
                        </span>
                        {order.payment.method === "TRANSFER" && (
                          <span className="text-[9px] text-brand-gray-600 uppercase tracking-wider">Transfer Bank</span>
                        )}
                        {order.payment.method === "QRIS" && (
                          <span className="text-[9px] text-brand-gray-600 uppercase tracking-wider">QRIS</span>
                        )}
                        {order.payment.method === "EWALLET" && (
                          <span className="text-[9px] text-brand-gray-600 uppercase tracking-wider">E-Wallet</span>
                        )}
                        {order.payment.method === "MANUAL" && (
                          <span className="text-[9px] text-brand-gray-600 uppercase tracking-wider">Transfer/QRIS</span>
                        )}
                        {order.payment.method === "COD" && (
                          <span className="text-[9px] text-amber-600 uppercase tracking-wider font-bold">COD</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-brand-gray-500">{formatDateTime(order.createdAt)}</td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <AdminOrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                        currentTrackingNumber={order.trackingNumber}
                        currentTrackingCarrier={order.trackingCarrier}
                        currentNotes={order.notes}
                        currentAdminNote={(order as any).adminNote}
                        orderNumber={order.orderNumber}
                        buyerName={order.user.name}
                        buyerPhone={order.address?.phone}
                        buyerEmail={order.user.email}
                        buyerUserId={order.userId}
                      />
                              {/* Manual payment confirm/reject */}
                      {order.payment &&
                       ["MANUAL", "TRANSFER", "QRIS", "EWALLET"].includes(order.payment.method) &&
                       (order.payment.status === "WAITING_CONFIRMATION" || order.payment.status === "MANUAL_PENDING") && (
                        <AdminManualPaymentActions
                          orderId={order.id}
                          proofImageUrl={order.payment.proofImageUrl}
                          paymentStatus={order.payment.status}
                          paymentMethod={order.payment.method}
                          orderStatus={order.status}
                        />
                      )}
                      {/* COD confirm */}
                      {order.payment?.method === "COD" && (
                        <AdminManualPaymentActions
                          orderId={order.id}
                          proofImageUrl={null}
                          paymentStatus={order.payment.status}
                          paymentMethod="COD"
                          orderStatus={order.status}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

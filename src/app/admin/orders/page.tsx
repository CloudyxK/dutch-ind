import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import AdminOrderActions from "@/components/admin/AdminOrderActions";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase">Pesanan</h1>

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              {["No. Pesanan", "Pelanggan", "Produk", "Total", "Pembayaran", "Status", "Tanggal", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-brand-gray-800/50 transition-colors">
                <td className="p-4 font-mono text-sm font-bold">#{order.orderNumber}</td>
                <td className="p-4">
                  <p className="text-sm">{order.user.name}</p>
                  <p className="text-xs text-brand-gray-500">{order.user.email}</p>
                </td>
                <td className="p-4 text-sm text-brand-gray-400">
                  {order.items.length} item
                </td>
                <td className="p-4 text-sm font-bold">{formatPrice(order.total)}</td>
                <td className="p-4">
                  {order.payment && (
                    <span
                      className={`text-xs font-bold px-2 py-1 ${
                        order.payment.status === "SUCCESS"
                          ? "bg-green-900/40 text-green-400"
                          : order.payment.status === "FAILED"
                          ? "bg-red-900/40 text-red-400"
                          : "bg-yellow-900/40 text-yellow-400"
                      }`}
                    >
                      {order.payment.status === "SUCCESS"
                        ? "Lunas"
                        : order.payment.status === "FAILED"
                        ? "Gagal"
                        : "Pending"}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="p-4 text-xs text-brand-gray-500">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="p-4">
                  <AdminOrderActions
                    orderId={order.id}
                    currentStatus={order.status}
                    currentTrackingNumber={order.trackingNumber}
                    currentTrackingCarrier={order.trackingCarrier}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

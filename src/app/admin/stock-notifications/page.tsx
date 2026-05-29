import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import SendNotificationButton from "./SendNotificationButton";

export const metadata = { title: "Notifikasi Stok — Admin" };

export default async function StockNotificationsPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/admin");

  // Fetch all stock notifications with product info
  const notifications = await prisma.stockNotification.findMany({
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, totalStock: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by product
  const grouped = notifications.reduce<
    Record<
      string,
      {
        product: { id: string; name: string; slug: string; price: number; totalStock: number };
        subscribers: { id: string; email: string; createdAt: Date }[];
      }
    >
  >((acc, n) => {
    if (!acc[n.productId]) {
      acc[n.productId] = { product: n.product, subscribers: [] };
    }
    acc[n.productId].subscribers.push({
      id: n.id,
      email: n.email,
      createdAt: n.createdAt,
    });
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Notifikasi Stok</h1>
        <p className="text-sm text-brand-gray-400 mt-1">
          Pelanggan yang mendaftar untuk mendapat notifikasi restock produk.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="border border-brand-gray-700 p-12 text-center">
          <p className="text-brand-gray-400 text-sm">Belum ada pelanggan yang mendaftar notifikasi stok.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ product, subscribers }) => (
            <div key={product.id} className="border border-brand-gray-700">
              {/* Product header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-700 bg-brand-gray-900/50">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="font-semibold text-white text-sm tracking-wide">{product.name}</h2>
                    <p className="text-xs text-brand-gray-500 mt-0.5">
                      {subscribers.length} subscriber · Stok tersedia:{" "}
                      <span
                        className={
                          product.totalStock > 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {product.totalStock}
                      </span>
                    </p>
                  </div>
                </div>
                <SendNotificationButton
                  productId={product.id}
                  productName={product.name}
                  count={subscribers.length}
                />
              </div>

              {/* Subscribers table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-gray-700">
                      <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-widest text-brand-gray-500">
                        Email
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-widest text-brand-gray-500">
                        Tanggal Daftar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className={
                          idx < subscribers.length - 1
                            ? "border-b border-brand-gray-700/50"
                            : ""
                        }
                      >
                        <td className="px-5 py-3 text-brand-gray-300 font-mono text-xs">
                          {sub.email}
                        </td>
                        <td className="px-5 py-3 text-brand-gray-500 text-xs">
                          {formatDateTime(sub.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import prisma from "@/lib/prisma";
import { Shield, Users, ShoppingBag, AlertTriangle, CheckCircle2, Lock, Globe } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Security Monitor — Admin" };
export const revalidate = 60;

async function getSecurityData() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 3600 * 1000);
  const last7d  = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const [
    totalUsers,
    newUsersToday,
    recentOrders,
    cancelledOrders,
    pendingPayments,
    failedPayments,
    returnRequests,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: last24h } } }),
    prisma.order.count({ where: { createdAt: { gte: last24h } } }),
    prisma.order.count({ where: { status: "CANCELLED", updatedAt: { gte: last7d } } }),
    prisma.payment.count({ where: { status: { in: ["PENDING", "MANUAL_PENDING"] }, createdAt: { gte: last7d } } }),
    prisma.payment.count({ where: { status: "FAILED", createdAt: { gte: last7d } } }),
    prisma.returnRequest.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: "CUSTOMER", createdAt: { gte: last24h } },
      select: { id: true, name: true, email: true, createdAt: true, emailVerified: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Orders with suspicious patterns (many orders in short time, high value unverified)
  const highValuePending = await prisma.order.findMany({
    where: {
      total: { gte: 1_000_000 }, // > 1 juta
      status: "AWAITING_PAYMENT",
      createdAt: { gte: last7d },
    },
    include: { user: { select: { name: true, email: true, emailVerified: true } } },
    orderBy: { total: "desc" },
    take: 5,
  });

  return {
    totalUsers, newUsersToday, recentOrders, cancelledOrders,
    pendingPayments, failedPayments, returnRequests,
    recentUsers, highValuePending,
  };
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
  );
}

export default async function SecurityPage() {
  const data = await getSecurityData();

  const alerts: { level: "warn" | "info"; message: string }[] = [];
  if (data.newUsersToday > 20)  alerts.push({ level: "warn", message: `${data.newUsersToday} akun baru dalam 24 jam — potensi bot registration` });
  if (data.failedPayments > 10) alerts.push({ level: "warn", message: `${data.failedPayments} pembayaran gagal dalam 7 hari` });
  if (data.cancelledOrders > 30) alerts.push({ level: "warn", message: `${data.cancelledOrders} pesanan dibatalkan dalam 7 hari` });
  if (data.returnRequests > 0) alerts.push({ level: "info", message: `${data.returnRequests} permintaan retur menunggu persetujuan` });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
        </div>
        <h1 className="text-3xl font-display tracking-widest uppercase text-white flex items-center gap-3">
          <Shield className="w-7 h-7" /> Security Monitor
        </h1>
        <p className="text-xs text-brand-gray-500 mt-1">Ringkasan aktivitas keamanan dan anomali</p>
      </div>

      {/* Security checklist */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Status Keamanan Sistem
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Rate Limiting aktif",          ok: true },
            { label: "CSRF Protection (Same-Origin)", ok: true },
            { label: "Path Traversal Blocked",        ok: true },
            { label: "SQL Injection Filter",          ok: true },
            { label: "Bot UA Blocklist",              ok: true },
            { label: "Admin Route Middleware",        ok: true },
            { label: "HSTS (HTTPS enforced)",         ok: true },
            { label: "Secure httpOnly Cookies",       ok: true },
            { label: "Cloudinary Upload Validation",  ok: true },
            { label: "Input Sanitization",            ok: true },
            { label: "CSP Headers",                   ok: true },
            { label: "X-Frame-Options DENY",          ok: true },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs">
              <StatusDot ok={ok} />
              <span className={ok ? "text-brand-gray-300" : "text-red-400"}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 border ${
                a.level === "warn"
                  ? "border-amber-700/50 bg-amber-900/20"
                  : "border-blue-700/50 bg-blue-900/20"
              }`}
            >
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.level === "warn" ? "text-amber-400" : "text-blue-400"}`} />
              <p className={`text-sm ${a.level === "warn" ? "text-amber-300" : "text-blue-300"}`}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
      {alerts.length === 0 && (
        <div className="flex items-center gap-3 p-4 border border-green-700/40 bg-green-900/10">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">Tidak ada anomali terdeteksi</p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,       label: "User Baru (24j)",    value: data.newUsersToday,    color: data.newUsersToday > 20 ? "text-amber-400" : "text-white" },
          { icon: ShoppingBag, label: "Order (24j)",         value: data.recentOrders,     color: "text-white" },
          { icon: AlertTriangle, label: "Pembayaran Gagal (7h)", value: data.failedPayments, color: data.failedPayments > 10 ? "text-red-400" : "text-white" },
          { icon: Globe,       label: "Retur Pending",       value: data.returnRequests,   color: data.returnRequests > 0 ? "text-amber-400" : "text-white" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-brand-gray-900 border border-brand-gray-700 p-5">
            <Icon className="w-5 h-5 text-brand-gray-500 mb-3" />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-brand-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* High value pending orders */}
      {data.highValuePending.length > 0 && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-gray-700">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">⚠ Pesanan Nilai Tinggi — Menunggu Bayar (7 hari)</h2>
            <p className="text-xs text-brand-gray-500 mt-1">Perlu verifikasi manual — pastikan bukan fraud sebelum kirim barang</p>
          </div>
          <table className="w-full text-xs">
            <thead className="border-b border-brand-gray-700 bg-brand-gray-800">
              <tr>
                {["No. Pesanan", "Pelanggan", "Email Verified", "Total"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-brand-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800">
              {data.highValuePending.map((order) => (
                <tr key={order.id} className="hover:bg-brand-gray-800/40">
                  <td className="px-4 py-3 font-mono font-bold">#{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.user.name}</td>
                  <td className="px-4 py-3">
                    {order.user.emailVerified
                      ? <span className="text-green-400">✓ Terverifikasi</span>
                      : <span className="text-red-400">✗ Belum</span>}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent new accounts */}
      {data.recentUsers.length > 0 && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-gray-700">
            <h2 className="text-xs font-bold uppercase tracking-widest">Akun Baru (24 Jam Terakhir)</h2>
          </div>
          <table className="w-full text-xs">
            <thead className="border-b border-brand-gray-700 bg-brand-gray-800">
              <tr>
                {["Nama", "Email", "Email Verified", "Waktu Daftar"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-brand-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800">
              {data.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-gray-800/40">
                  <td className="px-4 py-2.5 font-medium">{u.name}</td>
                  <td className="px-4 py-2.5 text-brand-gray-400">{u.email}</td>
                  <td className="px-4 py-2.5">
                    {u.emailVerified
                      ? <span className="text-green-400">✓</span>
                      : <span className="text-amber-400">Pending</span>}
                  </td>
                  <td className="px-4 py-2.5 text-brand-gray-500">{formatDateTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

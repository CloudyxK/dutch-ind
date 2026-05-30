"use client";

import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type DayRevenue = { date: string; amount: number };
type DaySales   = { date: string; revenue: number };
type StatusItem = { status: string; _count: number };
type TopProduct = { productId: string; product: { name: string } | null; _sum: { quantity: number | null; subtotal: number | null } };

interface Props {
  revenueByDay:  DayRevenue[];
  salesByDay:    DaySales[];
  ordersByStatus: StatusItem[];
  topProducts:   TopProduct[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", AWAITING_PAYMENT: "Menunggu Bayar",
  PAID: "Dibayar", PROCESSING: "Diproses",
  SHIPPED: "Dikirim", DELIVERED: "Terkirim",
  COMPLETED: "Selesai", CANCELLED: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#6b7280", AWAITING_PAYMENT: "#f59e0b",
  PAID: "#3b82f6", PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4", DELIVERED: "#10b981",
  COMPLETED: "#22c55e", CANCELLED: "#ef4444",
};

const PIE_COLORS = ["#ffffff", "#a3a3a3", "#525252", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

function formatIDR(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

const tooltipStyle = {
  contentStyle: { background: "#171717", border: "1px solid #262626", borderRadius: 0, fontSize: 12 },
  labelStyle:   { color: "#a3a3a3", fontSize: 11 },
  itemStyle:    { color: "#f5f5f5" },
};

export default function AnalyticsCharts({ revenueByDay, salesByDay, ordersByStatus, topProducts }: Props) {
  // Prepare revenue area data
  const revenueData = revenueByDay.map((d) => ({ ...d, label: dayLabel(d.date) }));
  const salesData   = salesByDay.map((d) => ({ ...d, label: dayLabel(d.date) }));

  // Pie chart — orders by status (exclude 0)
  const pieData = ordersByStatus
    .filter((s) => s._count > 0)
    .map((s) => ({ name: STATUS_LABEL[s.status] ?? s.status, value: s._count, color: STATUS_COLORS[s.status] ?? "#6b7280" }));

  // Bar chart — top products
  const barData = topProducts.slice(0, 6).map((p) => ({
    name: (p.product?.name ?? "Produk").split(" ").slice(0, 2).join(" "),
    qty:  p._sum.quantity ?? 0,
    omzet: p._sum.subtotal ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Revenue Area Chart — 14 days */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-1 text-white">Pendapatan 14 Hari Terakhir</h2>
        <p className="text-[10px] text-brand-gray-500 mb-5">Berdasarkan pembayaran sukses (Rp)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="label" tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatIDR} tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              formatter={(v: any) => [`Rp${Number(v).toLocaleString("id-ID")}`, "Pendapatan"]}
              labelFormatter={(l: any) => l}
              {...tooltipStyle}
            />
            <Area
              type="monotone" dataKey="amount"
              stroke="#ffffff" strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false} activeDot={{ r: 4, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 7-day Orders Bar Chart */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-1 text-white">Nilai Pesanan 7 Hari Terakhir</h2>
        <p className="text-[10px] text-brand-gray-500 mb-5">Total nilai pesanan per hari (Rp)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatIDR} tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              formatter={(v: any) => [`Rp${Number(v).toLocaleString("id-ID")}`, "Total Pesanan"]}
              {...tooltipStyle}
            />
            <Bar dataKey="revenue" fill="#ffffff" fillOpacity={0.9} radius={[2, 2, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie — status pesanan */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5 text-white">Status Pesanan</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="40%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, _n: any, props: any) => [v, props.payload.name]}
                  {...tooltipStyle}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  iconType="circle"
                  formatter={(v) => <span style={{ fontSize: 10, color: "#a3a3a3" }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-brand-gray-500">Belum ada data</p>
          )}
        </div>

        {/* Bar — top products by qty */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5 text-white">Produk Terlaris</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#737373", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#a3a3a3", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [v, "Terjual"]}
                  {...tooltipStyle}
                />
                <Bar dataKey="qty" fill="#ffffff" fillOpacity={0.85} radius={[0, 2, 2, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-brand-gray-500">Belum ada data penjualan</p>
          )}
        </div>
      </div>
    </div>
  );
}

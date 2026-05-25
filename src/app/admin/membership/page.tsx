"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Loader2, Crown, Info, RotateCcw } from "lucide-react";
import { RANKS, type RankKey } from "@/lib/rank";
import { formatPrice } from "@/lib/utils";

type RankRow = {
  key:          string;
  label:        string;
  icon:         string;
  minSpend:     number;
  discountPct:  number;
  freeShipping: string[];
  description:  string;
};

const SHIPPING_OPTIONS = [
  { value: "reguler",  label: "Reguler" },
  { value: "ekspres",  label: "Ekspres" },
  { value: "sameday",  label: "Same Day" },
];

const RANK_STYLES: Record<string, { text: string; border: string; bg: string }> = {
  BRONZE:   { text: "text-amber-500",  border: "border-amber-700",  bg: "from-amber-900 to-amber-700"  },
  SILVER:   { text: "text-slate-400",  border: "border-slate-500",  bg: "from-slate-600 to-slate-400"  },
  GOLD:     { text: "text-yellow-400", border: "border-yellow-500", bg: "from-yellow-700 to-yellow-500" },
  PLATINUM: { text: "text-violet-400", border: "border-violet-500", bg: "from-violet-800 to-violet-500" },
  DIAMOND:  { text: "text-cyan-400",   border: "border-cyan-500",   bg: "from-cyan-700 to-cyan-400"    },
};

export default function MembershipSettingsPage() {
  const [rows, setRows]       = useState<RankRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/membership")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setRows(data);
      })
      .finally(() => setFetching(false));
  }, []);

  function update(idx: number, field: keyof RankRow, value: any) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  function toggleShipping(idx: number, val: string) {
    setRows((prev) => prev.map((r, i) => {
      if (i !== idx) return r;
      const has = r.freeShipping.includes(val);
      return { ...r, freeShipping: has ? r.freeShipping.filter((x) => x !== val) : [...r.freeShipping, val] };
    }));
  }

  function resetDefaults() {
    if (!confirm("Reset ke pengaturan default?")) return;
    setRows(RANKS.map((r) => ({
      key: r.key, label: r.label, icon: r.icon,
      minSpend: r.minSpend, discountPct: r.discountPct,
      freeShipping: r.freeShipping as string[], description: r.description,
    })));
    toast("Reset ke default — klik Simpan untuk menyimpan", { icon: "↩️" });
  }

  async function save() {
    // Validasi: minSpend harus naik
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].minSpend <= rows[i - 1].minSpend) {
        toast.error(`Minimal belanja ${rows[i].label} harus lebih besar dari ${rows[i - 1].label}`);
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success("Pengaturan membership disimpan");
    } finally {
      setSaving(false);
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" /> Pengaturan Membership
          </h1>
          <p className="text-brand-gray-500 text-sm mt-1">
            Atur level rank, minimal belanja, diskon otomatis &amp; gratis ongkir per level
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetDefaults} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <RotateCcw className="w-4 h-4" /> Reset Default
          </button>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-brand-gray-900 border border-brand-gray-700 text-xs text-brand-gray-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
        <div className="space-y-1">
          <p><strong className="text-white">Diskon Rank</strong> diterapkan otomatis dari subtotal setelah diskon kupon, saat pelanggan checkout.</p>
          <p><strong className="text-white">Gratis Ongkir</strong> berlaku jika metode pengiriman yang dipilih termasuk dalam daftar gratis rank tersebut.</p>
          <p><strong className="text-white">Minimal Belanja</strong> dihitung dari total akumulatif semua pesanan yang berhasil.</p>
        </div>
      </div>

      {/* Rank cards */}
      <div className="space-y-4">
        {rows.map((row, idx) => {
          const style = RANK_STYLES[row.key] ?? RANK_STYLES["BRONZE"];
          return (
            <div key={row.key} className={`bg-brand-gray-900 border ${style.border} overflow-hidden`}>
              {/* Rank header */}
              <div className={`bg-gradient-to-r ${style.bg} px-5 py-3 flex items-center gap-3`}>
                <span className="text-3xl">{row.icon}</span>
                <div>
                  <p className="text-white font-display text-lg tracking-widest uppercase font-bold">{row.label}</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Level {idx + 1}</p>
                </div>
                {idx === 0 && (
                  <span className="ml-auto text-xs text-white/60 italic">Level awal — semua member baru</span>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Min Spend */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Minimal Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={row.minSpend}
                    disabled={idx === 0}
                    onChange={(e) => update(idx, "minSpend", parseFloat(e.target.value) || 0)}
                    className="input-field w-full py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  {idx === 0
                    ? <p className="text-[10px] text-brand-gray-600 mt-1">Selalu Rp 0 (default)</p>
                    : <p className="text-[10px] text-brand-gray-500 mt-1">≥ {formatPrice(row.minSpend)}</p>
                  }
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Diskon Otomatis (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={row.discountPct}
                      onChange={(e) => update(idx, "discountPct", parseFloat(e.target.value) || 0)}
                      className="input-field w-full py-2 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 text-sm">%</span>
                  </div>
                  <p className="text-[10px] text-brand-gray-500 mt-1">
                    {row.discountPct > 0 ? `Hemat ${row.discountPct}% dari subtotal` : "Tidak ada diskon"}
                  </p>
                </div>

                {/* Free Shipping */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Gratis Ongkir</label>
                  <div className="space-y-2">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const checked = row.freeShipping.includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                          <div
                            onClick={() => toggleShipping(idx, opt.value)}
                            className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                              checked ? "bg-white border-white" : "border-brand-gray-600"
                            }`}
                          >
                            {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Deskripsi Keuntungan
                  </label>
                  <textarea
                    rows={3}
                    value={row.description}
                    onChange={(e) => update(idx, "description", e.target.value)}
                    className="input-field w-full py-2 resize-none text-sm"
                    placeholder="Contoh: Diskon 5% + Gratis Ongkir Reguler"
                  />
                  <p className="text-[10px] text-brand-gray-600 mt-1">Ditampilkan di profil member</p>
                </div>
              </div>

              {/* Summary bar */}
              <div className={`px-5 py-2.5 border-t border-brand-gray-800 bg-brand-gray-950 flex flex-wrap gap-4 text-[11px]`}>
                <span className={`font-bold ${style.text}`}>{row.icon} {row.label}</span>
                <span className="text-brand-gray-500">
                  Threshold: <strong className="text-white">{formatPrice(row.minSpend)}</strong>
                </span>
                <span className="text-brand-gray-500">
                  Diskon: <strong className={row.discountPct > 0 ? "text-green-400" : "text-brand-gray-600"}>
                    {row.discountPct > 0 ? `${row.discountPct}%` : "—"}
                  </strong>
                </span>
                <span className="text-brand-gray-500">
                  Gratis ongkir: <strong className={row.freeShipping.length > 0 ? "text-green-400" : "text-brand-gray-600"}>
                    {row.freeShipping.length > 0 ? row.freeShipping.join(", ") : "—"}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live preview table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-4 text-brand-gray-400">Preview Tabel Semua Level</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gray-700 text-[11px] text-brand-gray-500 uppercase tracking-wider">
                <th className="text-left py-2 pr-4">Level</th>
                <th className="text-left py-2 pr-4">Min. Belanja</th>
                <th className="text-left py-2 pr-4">Diskon</th>
                <th className="text-left py-2 pr-4">Gratis Ongkir</th>
                <th className="text-left py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800">
              {rows.map((row) => {
                const style = RANK_STYLES[row.key] ?? RANK_STYLES["BRONZE"];
                return (
                  <tr key={row.key}>
                    <td className="py-2.5 pr-4">
                      <span className={`font-bold ${style.text}`}>{row.icon} {row.label}</span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs">{formatPrice(row.minSpend)}</td>
                    <td className="py-2.5 pr-4">
                      {row.discountPct > 0
                        ? <span className="text-green-400 font-bold">{row.discountPct}%</span>
                        : <span className="text-brand-gray-600">—</span>}
                    </td>
                    <td className="py-2.5 pr-4">
                      {row.freeShipping.length > 0
                        ? <span className="text-green-400 capitalize">{row.freeShipping.join(", ")}</span>
                        : <span className="text-brand-gray-600">—</span>}
                    </td>
                    <td className="py-2.5 text-brand-gray-400 text-xs">{row.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-2.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}

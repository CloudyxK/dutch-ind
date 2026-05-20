"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Zap, Trash2, Save, Loader2 } from "lucide-react";

type Config = {
  active: boolean;
  title: string;
  subtitle: string;
  endAt: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  couponCode: string;
};

const EMPTY: Config = {
  active: true,
  title: "Flash Sale",
  subtitle: "Semua produk pilihan",
  endAt: "",
  discountType: "PERCENTAGE",
  discountValue: 20,
  couponCode: "FLASHSALE",
};

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // datetime-local format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FlashSalePage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config>(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<{ hari:number; jam:number; menit:number; detik:number } | null>(null);

  // Fetch current config
  useEffect(() => {
    fetch("/api/admin/flashsale")
      .then(r => r.json())
      .then(({ data }) => {
        if (data) setConfig({ ...EMPTY, ...data });
      })
      .finally(() => setFetching(false));
  }, []);

  // Live preview countdown
  useEffect(() => {
    if (!config.endAt) { setPreview(null); return; }
    const calc = () => {
      const diff = new Date(config.endAt).getTime() - Date.now();
      if (diff <= 0) { setPreview({ hari: 0, jam: 0, menit: 0, detik: 0 }); return; }
      const s = Math.floor(diff / 1000);
      setPreview({
        hari:  Math.floor(s / 86400),
        jam:   Math.floor((s % 86400) / 3600),
        menit: Math.floor((s % 3600) / 60),
        detik: s % 60,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [config.endAt]);

  const set = (key: keyof Config, value: any) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!config.endAt) { toast.error("Waktu berakhir wajib diisi"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flashsale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal menyimpan"); return; }
      toast.success("Flash sale disimpan");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Hapus flash sale?")) return;
    setDeleting(true);
    try {
      await fetch("/api/admin/flashsale", { method: "DELETE" });
      setConfig(EMPTY);
      toast.success("Flash sale dihapus");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500"/>
    </div>
  );

  const pad = (n: number) => String(n).padStart(2, "0");
  const isExpired = config.endAt ? new Date(config.endAt) <= new Date() : false;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
            <Zap className="w-6 h-6"/> Flash Sale
          </h1>
          <p className="text-brand-gray-500 text-sm mt-1">
            Atur banner flash sale & countdown di halaman utama
          </p>
        </div>

        {/* Status badge */}
        {config.endAt && (
          <span className={`text-xs font-bold px-3 py-1.5 ${
            !config.active   ? "bg-brand-gray-800 text-brand-gray-400" :
            isExpired        ? "bg-red-900/40 text-red-400" :
                               "bg-green-900/40 text-green-400"
          }`}>
            {!config.active ? "Non-aktif" : isExpired ? "Sudah Berakhir" : "Aktif"}
          </span>
        )}
      </div>

      {/* Live preview countdown */}
      {preview && config.endAt && (
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-5">
          <p className="text-xs text-brand-gray-500 uppercase tracking-widest mb-3">Preview Countdown</p>
          <div className="flex items-start gap-2">
            {[
              { v: pad(preview.hari),  l: "Hari"  },
              { v: pad(preview.jam),   l: "Jam"   },
              { v: pad(preview.menit), l: "Menit" },
              { v: pad(preview.detik), l: "Detik" },
            ].map(({ v, l }, i) => (
              <div key={l} className="flex items-start gap-2">
                <div className="text-center">
                  <div className="w-14 h-14 bg-black border border-brand-gray-700 flex items-center justify-center text-xl font-display text-white">
                    {v}
                  </div>
                  <p className="text-[9px] uppercase tracking-widest mt-1 text-brand-gray-600">{l}</p>
                </div>
                {i < 3 && <span className="text-xl font-bold text-brand-gray-700 mt-3">:</span>}
              </div>
            ))}
            {isExpired && (
              <span className="ml-4 self-center text-xs text-red-400 font-bold uppercase tracking-wider">
                ⚠ Waktu habis
              </span>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-5">

        {/* Active toggle */}
        <div className="flex items-center justify-between py-2 border-b border-brand-gray-800">
          <div>
            <p className="text-sm font-semibold">Aktifkan Flash Sale</p>
            <p className="text-xs text-brand-gray-500 mt-0.5">
              Tampilkan banner flash sale di halaman utama
            </p>
          </div>
          <button
            type="button"
            onClick={() => set("active", !config.active)}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.active ? "bg-white" : "bg-brand-gray-700"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${config.active ? "translate-x-7" : "translate-x-1"}`}/>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="input-label">Judul Flash Sale</label>
          <input value={config.title} onChange={e => set("title", e.target.value)}
                 className="input-field" placeholder="Contoh: Flash Sale"/>
        </div>

        {/* Subtitle */}
        <div>
          <label className="input-label">Subjudul / Deskripsi Singkat</label>
          <input value={config.subtitle} onChange={e => set("subtitle", e.target.value)}
                 className="input-field" placeholder="Contoh: Semua produk pilihan"/>
        </div>

        {/* End date time */}
        <div>
          <label className="input-label">Waktu Berakhir Flash Sale</label>
          <input
            type="datetime-local"
            value={toLocalInput(config.endAt)}
            onChange={e => set("endAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
            className="input-field"
            style={{ colorScheme: "dark" }}
          />
          <p className="text-[10px] text-brand-gray-600 mt-1">
            Countdown akan berhenti dan banner otomatis hilang saat waktu ini tercapai
          </p>
        </div>

        {/* Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Tipe Diskon</label>
            <select value={config.discountType} onChange={e => set("discountType", e.target.value)}
                    className="input-field">
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED">Nominal (Rp)</option>
            </select>
          </div>
          <div>
            <label className="input-label">
              Nilai Diskon {config.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
            </label>
            <input
              type="number" min="1"
              max={config.discountType === "PERCENTAGE" ? 100 : undefined}
              value={config.discountValue}
              onChange={e => set("discountValue", Number(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        {/* Coupon code */}
        <div>
          <label className="input-label">Kode Kupon</label>
          <input
            value={config.couponCode}
            onChange={e => set("couponCode", e.target.value.toUpperCase())}
            className="input-field font-mono"
            placeholder="FLASHSALE"
          />
          <p className="text-[10px] text-brand-gray-600 mt-1">
            Kupon ini akan otomatis dibuat/diperbarui di sistem saat kamu simpan
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
          Simpan Flash Sale
        </button>
        <button onClick={remove} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 text-sm transition-colors disabled:opacity-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
          Hapus Flash Sale
        </button>
      </div>
    </div>
  );
}

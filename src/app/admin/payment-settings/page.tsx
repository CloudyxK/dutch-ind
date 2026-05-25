"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, Loader2, Banknote, QrCode, Wallet } from "lucide-react";

type Bank    = { name: string; number: string; holder: string };
type EWallet = { name: string; number: string; holder: string };
type Config  = { banks: Bank[]; ewallets: EWallet[]; qrisImageUrl: string; instructions: string };

const EMPTY: Config = { banks: [], ewallets: [], qrisImageUrl: "", instructions: "" };

const EWALLET_PRESETS = ["GoPay", "ShopeePay", "DANA", "OVO", "LinkAja"];

export default function PaymentSettingsPage() {
  const [config, setConfig]   = useState<Config>(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then(r => r.json())
      .then(({ data }) => { if (data) setConfig({ ...EMPTY, ...data }); })
      .finally(() => setFetching(false));
  }, []);

  /* ── Bank ── */
  const addBank    = () => setConfig(prev => ({ ...prev, banks: [...prev.banks, { name: "", number: "", holder: "" }] }));
  const updateBank = (i: number, field: keyof Bank, value: string) =>
    setConfig(prev => { const banks = [...prev.banks]; banks[i] = { ...banks[i], [field]: value }; return { ...prev, banks }; });
  const removeBank = (i: number) => setConfig(prev => ({ ...prev, banks: prev.banks.filter((_, idx) => idx !== i) }));

  /* ── E-Wallet ── */
  const addEWallet    = (preset?: string) =>
    setConfig(prev => ({ ...prev, ewallets: [...prev.ewallets, { name: preset || "", number: "", holder: "" }] }));
  const updateEWallet = (i: number, field: keyof EWallet, value: string) =>
    setConfig(prev => { const ewallets = [...prev.ewallets]; ewallets[i] = { ...ewallets[i], [field]: value }; return { ...prev, ewallets }; });
  const removeEWallet = (i: number) => setConfig(prev => ({ ...prev, ewallets: prev.ewallets.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success("Pengaturan disimpan");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
          <Banknote className="w-6 h-6" /> Pengaturan Pembayaran Manual
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Info rekening bank, e-wallet &amp; QRIS yang ditampilkan ke pembeli
        </p>
      </div>

      {/* Bank accounts */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Banknote className="w-4 h-4" /> Rekening Bank
          </h2>
          <button onClick={addBank}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-brand-gray-600 hover:border-white transition-colors">
            <Plus className="w-3 h-3" /> Tambah Rekening
          </button>
        </div>

        {config.banks.length === 0 && (
          <p className="text-sm text-brand-gray-500 py-4 text-center">
            Belum ada rekening. Klik "Tambah Rekening" untuk menambahkan.
          </p>
        )}

        {config.banks.map((bank, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 p-4 border border-brand-gray-800 relative">
            <button onClick={() => removeBank(i)}
                    className="absolute top-2 right-2 text-brand-gray-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div>
              <label className="input-label">Nama Bank</label>
              <input value={bank.name} onChange={e => updateBank(i, "name", e.target.value)}
                     className="input-field" placeholder="BCA" />
            </div>
            <div>
              <label className="input-label">No. Rekening</label>
              <input value={bank.number} onChange={e => updateBank(i, "number", e.target.value)}
                     className="input-field font-mono" placeholder="1234567890" />
            </div>
            <div>
              <label className="input-label">Atas Nama</label>
              <input value={bank.holder} onChange={e => updateBank(i, "holder", e.target.value)}
                     className="input-field" placeholder="FAREL ADINATA" />
            </div>
          </div>
        ))}
      </div>

      {/* E-Wallet */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4" /> E-Wallet
          </h2>
          <button onClick={() => addEWallet()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-brand-gray-600 hover:border-white transition-colors">
            <Plus className="w-3 h-3" /> Tambah E-Wallet
          </button>
        </div>

        {/* Preset shortcuts */}
        <div className="flex flex-wrap gap-2">
          {EWALLET_PRESETS.map(p => (
            <button key={p} onClick={() => addEWallet(p)}
                    className="text-[10px] px-2.5 py-1 border border-brand-gray-700 hover:border-white text-brand-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              + {p}
            </button>
          ))}
        </div>

        {config.ewallets.length === 0 && (
          <p className="text-sm text-brand-gray-500 py-2 text-center">
            Belum ada e-wallet. Klik preset di atas atau "Tambah E-Wallet".
          </p>
        )}

        {config.ewallets.map((ew, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 p-4 border border-brand-gray-800 relative">
            <button onClick={() => removeEWallet(i)}
                    className="absolute top-2 right-2 text-brand-gray-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div>
              <label className="input-label">E-Wallet</label>
              <input value={ew.name} onChange={e => updateEWallet(i, "name", e.target.value)}
                     className="input-field" placeholder="GoPay" />
            </div>
            <div>
              <label className="input-label">No. HP / ID</label>
              <input value={ew.number} onChange={e => updateEWallet(i, "number", e.target.value)}
                     className="input-field font-mono" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="input-label">Atas Nama</label>
              <input value={ew.holder} onChange={e => updateEWallet(i, "holder", e.target.value)}
                     className="input-field" placeholder="FAREL ADINATA" />
            </div>
          </div>
        ))}
      </div>

      {/* QRIS */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <QrCode className="w-4 h-4" /> QRIS Statis
        </h2>
        <div>
          <label className="input-label">URL Gambar QRIS</label>
          <input value={config.qrisImageUrl}
                 onChange={e => setConfig(prev => ({ ...prev, qrisImageUrl: e.target.value }))}
                 className="input-field" placeholder="https://..." />
          <p className="text-[10px] text-brand-gray-600 mt-1">
            Upload foto QRIS ke Google Drive / Imgur dan paste link-nya di sini
          </p>
        </div>
        {config.qrisImageUrl && (
          <div className="flex justify-center p-4 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={config.qrisImageUrl} alt="QRIS Preview"
                 className="max-w-[200px] max-h-[200px] object-contain" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
        <label className="input-label">Instruksi Pembayaran</label>
        <textarea value={config.instructions}
                  onChange={e => setConfig(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={4} className="input-field resize-none"
                  placeholder="Contoh: Transfer tepat sesuai nominal. Sertakan nomor pesanan pada keterangan transfer." />
      </div>

      <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Simpan Pengaturan
      </button>
    </div>
  );
}

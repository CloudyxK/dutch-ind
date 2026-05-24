"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Loader2, MessageCircle, Instagram, Mail, Clock, AtSign } from "lucide-react";

type Config = {
  whatsapp:         string;
  whatsappMessage:  string;
  instagram:        string;
  tiktok:           string;
  email:            string;
  operationalHours: string;
};

const EMPTY: Config = {
  whatsapp:         "",
  whatsappMessage:  "Halo, saya ingin bertanya tentang produk DUTCH.IND.",
  instagram:        "",
  tiktok:           "",
  email:            "",
  operationalHours: "Senin–Sabtu, 09.00–21.00 WITA",
};

export default function ContactSettingsPage() {
  const [config, setConfig] = useState<Config>(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact-settings")
      .then(r => r.json())
      .then(({ data }) => { if (data) setConfig({ ...EMPTY, ...data }); })
      .finally(() => setFetching(false));
  }, []);

  const set = (key: keyof Config, value: string) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/contact-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success("Kontak berhasil disimpan");
    } finally {
      setSaving(false);
    }
  };

  const waPreview = config.whatsapp
    ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(config.whatsappMessage)}`
    : null;

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display tracking-widest uppercase flex items-center gap-3">
          <MessageCircle className="w-6 h-6" /> Kontak & Customer Service
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Info kontak yang tampil di footer, halaman pesanan, dan tombol floating
        </p>
      </div>

      {/* WhatsApp */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp
        </h2>
        <div>
          <label className="input-label">Nomor WhatsApp</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-gray-500">+</span>
            <input
              value={config.whatsapp}
              onChange={e => set("whatsapp", e.target.value)}
              className="input-field pl-7"
              placeholder="6285217733737"
            />
          </div>
          <p className="text-[10px] text-brand-gray-600 mt-1">
            Format internasional tanpa + (contoh: 6285217733737)
          </p>
        </div>
        <div>
          <label className="input-label">Pesan Default WhatsApp</label>
          <textarea
            value={config.whatsappMessage}
            onChange={e => set("whatsappMessage", e.target.value)}
            className="input-field resize-none h-20"
            placeholder="Pesan otomatis saat pembeli klik tombol WA..."
          />
        </div>
        {waPreview && (
          <a href={waPreview} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> Preview link WA →
          </a>
        )}
      </div>

      {/* Social Media */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Instagram className="w-4 h-4" /> Social Media
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Instagram</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-500" />
              <input
                value={config.instagram}
                onChange={e => set("instagram", e.target.value.replace(/^@/, ""))}
                className="input-field pl-8"
                placeholder="dutch.ind"
              />
            </div>
          </div>
          <div>
            <label className="input-label">TikTok (opsional)</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-500" />
              <input
                value={config.tiktok}
                onChange={e => set("tiktok", e.target.value.replace(/^@/, ""))}
                className="input-field pl-8"
                placeholder="dutch.ind"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email & Hours */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email & Jam Operasional
        </h2>
        <div>
          <label className="input-label">Email CS</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-500" />
            <input
              value={config.email}
              onChange={e => set("email", e.target.value)}
              className="input-field pl-9"
              placeholder="cs@dutch-ind.com"
              type="email"
            />
          </div>
        </div>
        <div>
          <label className="input-label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Jam Operasional
          </label>
          <input
            value={config.operationalHours}
            onChange={e => set("operationalHours", e.target.value)}
            className="input-field"
            placeholder="Senin–Sabtu, 09.00–21.00 WITA"
          />
        </div>
      </div>

      <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Simpan Kontak
      </button>
    </div>
  );
}

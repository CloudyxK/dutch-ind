"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Users, Edit2, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

type Drop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  releaseDate: string;
  status: string;
  couponCode: string | null;
  _count: { waitlist: number };
};

const STATUS_OPTS = ["UPCOMING", "LIVE", "ENDED"];
const STATUS_COLOR: Record<string, string> = {
  UPCOMING: "text-yellow-400 border-yellow-800",
  LIVE:     "text-green-400 border-green-800",
  ENDED:    "text-brand-gray-500 border-brand-gray-700",
};

export default function AdminDropsPage() {
  const [drops, setDrops]   = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", releaseDate: "", couponCode: "", coverImage: "" });
  const [saving, setSaving] = useState(false);

  // Edit status
  const [editId, setEditId]     = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/drops");
    const data = await res.json();
    setDrops(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/drops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, releaseDate: form.releaseDate }),
    });
    if (res.ok) { setShowForm(false); setForm({ name: "", slug: "", description: "", releaseDate: "", couponCode: "", coverImage: "" }); load(); }
    setSaving(false);
  }

  async function handleStatusUpdate(id: string) {
    await fetch(`/api/admin/drops/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus }),
    });
    setEditId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus drop ini? Semua waitlist juga akan dihapus.")) return;
    await fetch(`/api/admin/drops/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display tracking-widest uppercase text-white">Drops</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-brand-gray-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Buat Drop
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2">Drop Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Nama Drop *</label>
              <input required value={form.name} onChange={(e) => { setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })); }} className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white font-mono" />
            </div>
            <div>
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Tanggal Release *</label>
              <input required type="datetime-local" value={form.releaseDate} onChange={(e) => setForm(f => ({ ...f, releaseDate: e.target.value }))} className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Kode Kupon (opsional)</label>
              <input value={form.couponCode} onChange={(e) => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))} placeholder="DROPEVENT25" className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white font-mono uppercase" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Deskripsi</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-gray-400 mb-1 uppercase tracking-widest">Cover Image URL (opsional)</label>
              <input value={form.coverImage} onChange={(e) => setForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." className="w-full bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:border-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-brand-gray-600 text-brand-gray-300 hover:border-white transition-colors">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-brand-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Drops list */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gray-500" /></div>
      ) : drops.length === 0 ? (
        <div className="text-center py-12 text-brand-gray-500 text-sm">Belum ada drop.</div>
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => (
            <div key={drop.id} className="bg-brand-gray-900 border border-brand-gray-700 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 ${STATUS_COLOR[drop.status] ?? "text-white border-white"}`}>
                    {drop.status}
                  </span>
                  <h3 className="font-bold text-sm">{drop.name}</h3>
                </div>
                <p className="text-xs text-brand-gray-400">
                  Release: {new Date(drop.releaseDate).toLocaleString("id-ID")}
                  {drop.couponCode && ` · Kode: ${drop.couponCode}`}
                </p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-brand-gray-500">
                  <Users className="w-3 h-3" />
                  {drop._count.waitlist} waitlist
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {editId === drop.id ? (
                  <>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="bg-brand-gray-800 border border-brand-gray-600 text-white text-xs px-2 py-1.5 focus:outline-none">
                      {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => handleStatusUpdate(drop.id)} className="p-1.5 hover:text-green-400"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1.5 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <button onClick={() => { setEditId(drop.id); setEditStatus(drop.status); }} className="p-1.5 text-brand-gray-400 hover:text-white transition-colors" title="Ubah status">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <Link href={`/drops/${drop.slug}`} target="_blank" className="p-1.5 text-brand-gray-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(drop.id)} className="p-1.5 text-brand-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

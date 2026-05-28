"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

type Props = { slug: string };

export default function DropWaitlistForm({ slug }: Props) {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/drops/${slug}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal mendaftar"); return; }
      setDone(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 text-green-400">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Berhasil didaftarkan!</p>
          <p className="text-xs text-brand-gray-400 mt-0.5">Kamu akan mendapat email saat drop ini live.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu (opsional)"
          className="flex-1 bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white placeholder:text-brand-gray-600"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email kamu"
          required
          className="flex-1 bg-brand-gray-800 border border-brand-gray-600 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white placeholder:text-brand-gray-600"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Daftar Waitlist
      </button>
    </form>
  );
}

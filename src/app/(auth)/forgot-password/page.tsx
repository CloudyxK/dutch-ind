"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Masukkan alamat email kamu"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Terjadi kesalahan"); return; }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block font-display tracking-[0.2em] text-xl uppercase">
            DUTCH.IND
          </Link>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5 text-green-400" />
            </div>
            <h1 className="text-lg font-display tracking-widest uppercase">Cek Email Kamu</h1>
            <p className="text-sm text-brand-gray-400 leading-relaxed">
              Jika email <strong className="text-white">{email}</strong> terdaftar, kami sudah mengirimkan link reset password. Link berlaku <strong className="text-white">1 jam</strong>.
            </p>
            <p className="text-xs text-brand-gray-600">
              Tidak menerima email? Periksa folder spam atau coba lagi.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-xs text-brand-gray-400 underline hover:text-white"
            >
              Coba dengan email lain
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-display tracking-widest uppercase mb-2">Lupa Password</h1>
              <p className="text-sm text-brand-gray-400">
                Masukkan email akun kamu. Kami akan kirimkan link untuk membuat password baru.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-xs text-red-400 border border-red-400/20 px-3 py-2">{error}</p>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-brand-gray-400 mb-2">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="email@kamu.com"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-brand-gray-500 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

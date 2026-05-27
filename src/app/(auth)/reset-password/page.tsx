"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email wajib diisi"); return; }
    if (password !== confirm) { setError("Password dan konfirmasi tidak cocok"); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal reset password"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-brand-gray-400">Link reset password tidak valid.</p>
        <Link href="/forgot-password" className="text-xs underline hover:text-white">
          Minta link baru
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center space-y-4">
      <CheckCircle className="w-10 h-10 mx-auto text-green-400" />
      <h1 className="text-xl font-display tracking-widest uppercase">Password Diperbarui!</h1>
      <p className="text-sm text-brand-gray-400">
        Password kamu berhasil diubah. Kamu akan diarahkan ke halaman login...
      </p>
      <Link href="/login" className="btn-primary block">Login Sekarang</Link>
    </div>
  ) : (
    <>
      <div>
        <h1 className="text-2xl font-display tracking-widest uppercase mb-2">Buat Password Baru</h1>
        <p className="text-sm text-brand-gray-400">Masukkan password baru untuk akunmu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-400 border border-red-400/20 px-3 py-2">{error}</p>
        )}

        {!emailParam && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-brand-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="Email akun kamu"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-gray-400 mb-2">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full pr-10"
              placeholder="Min. 8 karakter (huruf + angka)"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-brand-gray-400 mb-2">
            Konfirmasi Password
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field w-full"
            placeholder="Ulangi password baru"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block font-display tracking-[0.2em] text-xl uppercase">
            DUTCH.IND
          </Link>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-brand-gray-400">Memuat...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

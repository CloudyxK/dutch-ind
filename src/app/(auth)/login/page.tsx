"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Login berhasil!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80)" }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content pinned to bottom-left */}
        <div className="relative z-10 flex flex-col justify-end items-start p-12 pb-16 w-full">
          <Link href="/" className="text-5xl font-display tracking-widest text-white">
            DUTCH.IND
          </Link>
          <p className="text-sm text-white/70 mt-3 leading-relaxed">
            Streetwear premium untuk generasi urban Indonesia
          </p>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/20">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Produk Premium</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Member Aktif</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Rating Produk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-lg font-display tracking-widest lg:hidden mb-8 block">
            DUTCH.IND
          </Link>

          <h1 className="text-3xl font-display tracking-wider uppercase">Masuk</h1>
          <p className="text-sm text-brand-gray-400 mt-1">
            Belum punya akun?{" "}
            <Link href="/register" className="text-white underline hover:no-underline">
              Daftar sekarang
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Kata Sandi</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-brand-gray-400 hover:text-white">
                Lupa password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-brand-gray-500">
            Dengan masuk, kamu menyetujui{" "}
            <Link href="/terms" className="text-brand-gray-400 underline">
              Syarat & Ketentuan
            </Link>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
}

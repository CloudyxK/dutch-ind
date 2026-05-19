"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registrasi gagal");

      toast.success("Akun berhasil dibuat! Silakan masuk.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gray-900 items-center justify-center p-16">
        <div>
          <Link href="/" className="text-4xl font-display tracking-widest">
            DUTCH.IND
          </Link>
          <p className="mt-6 text-brand-gray-400 text-sm leading-relaxed max-w-sm">
            Bergabunglah dengan ribuan pelanggan setia kami dan nikmati
            pengalaman belanja streetwear premium Indonesia.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-lg font-display tracking-widest lg:hidden mb-8 block">
            DUTCH.IND
          </Link>

          <h1 className="text-3xl font-display tracking-wider uppercase">Daftar</h1>
          <p className="text-sm text-brand-gray-400 mt-1">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-white underline hover:no-underline">
              Masuk di sini
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="input-label">Nama Lengkap</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama lengkap kamu"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Nomor HP (Opsional)</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className="input-field pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Konfirmasi Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="input-field"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-2">
              {loading ? "Memproses..." : "Buat Akun"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-gray-500">
            Dengan mendaftar, kamu menyetujui{" "}
            <Link href="/terms" className="text-brand-gray-400 underline">Syarat & Ketentuan</Link> dan{" "}
            <Link href="/privacy" className="text-brand-gray-400 underline">Kebijakan Privasi</Link> kami.
          </p>
        </div>
      </div>
    </div>
  );
}

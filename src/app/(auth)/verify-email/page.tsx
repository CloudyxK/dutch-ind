"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan di URL.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(json.error || "Verifikasi gagal.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Terjadi kesalahan. Coba lagi nanti.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <Link href="/" className="inline-block font-display tracking-[0.2em] text-xl uppercase">
          DUTCH.IND
        </Link>

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-brand-gray-400" />
            <p className="text-sm text-brand-gray-400">Memverifikasi email kamu...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-10 h-10 mx-auto text-green-400" />
            <h1 className="text-xl font-display tracking-widest uppercase">Email Terverifikasi!</h1>
            <p className="text-sm text-brand-gray-400">
              Akun kamu sudah aktif. Silakan login dan mulai belanja.
            </p>
            <Link href="/login" className="btn-primary block">
              Login Sekarang
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-10 h-10 mx-auto text-red-400" />
            <h1 className="text-xl font-display tracking-widest uppercase">Verifikasi Gagal</h1>
            <p className="text-sm text-brand-gray-400">{message}</p>
            <p className="text-xs text-brand-gray-600">
              Link verifikasi berlaku 24 jam. Jika sudah kadaluarsa, coba daftar ulang atau hubungi kami.
            </p>
            <Link href="/" className="text-xs text-brand-gray-400 underline hover:text-white">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

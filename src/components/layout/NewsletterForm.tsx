"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterForm() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");
      setSuccess(true);
      setEmail("");
      toast.success("Berhasil! Kamu akan mendapat info drop terbaru.");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p className="text-sm text-green-400 font-medium py-3">
        Kamu sudah terdaftar. Nantikan info drop terbaru!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0 w-full md:w-80">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email kamu"
        required
        className="input-field flex-1 py-2 min-w-0"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary px-4 py-2 whitespace-nowrap flex-shrink-0 disabled:opacity-60"
      >
        {loading ? "..." : "Daftar"}
      </button>
    </form>
  );
}

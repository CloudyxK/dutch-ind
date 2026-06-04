"use client";

import { useState } from "react";
import { Send, Loader2, FlaskConical, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterBlastForm({ subscriberCount }: { subscriberCount: number }) {
  const [subject,   setSubject]   = useState("");
  const [message,   setMessage]   = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending,   setSending]   = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; total: number } | null>(null);

  async function send(isTest: boolean) {
    if (!subject.trim() || !message.trim()) { toast.error("Isi subjek dan pesan"); return; }
    if (isTest && !testEmail.trim()) { toast.error("Isi email untuk test"); return; }
    if (!isTest && subscriberCount === 0) { toast.error("Tidak ada subscriber"); return; }

    setSending(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, testEmail: isTest ? testEmail : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");

      if (isTest) {
        toast.success(`Test email terkirim ke ${testEmail}`);
      } else {
        toast.success(`Newsletter terkirim ke ${data.sent} dari ${data.total} subscriber!`);
        setLastResult({ sent: data.sent, total: data.total });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Send className="w-4 h-4" /> Kirim Newsletter Blast
        </h2>
        <p className="text-xs text-brand-gray-500 mt-1">
          Kirim email ke semua {subscriberCount} subscriber. Gunakan Test dulu sebelum blast ke semua.
        </p>
      </div>

      {lastResult && (
        <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700/40">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            Berhasil terkirim ke <strong>{lastResult.sent}</strong> dari {lastResult.total} subscriber.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="input-label">Subjek Email</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Contoh: Koleksi Baru DUTCH.IND Sudah Hadir! 🔥"
            maxLength={200}
            className="input-field"
          />
        </div>

        <div>
          <label className="input-label">Isi Pesan</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={"Halo para streetwear enthusiast,\n\nKoleksi terbaru kami sudah tersedia...\n\nShop now di dutch-ind.vercel.app"}
            rows={8}
            maxLength={5000}
            className="input-field resize-none"
          />
          <p className="text-[10px] text-brand-gray-600 mt-1">{message.length}/5000 karakter — gunakan baris kosong untuk paragraf baru</p>
        </div>

        {/* Preview */}
        {message && (
          <div className="border border-brand-gray-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 mb-2">Preview Pesan</p>
            <div className="text-sm text-brand-gray-300 leading-relaxed space-y-3">
              {message.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Test + Blast */}
        <div className="border-t border-brand-gray-700 pt-4 space-y-3">
          <div>
            <label className="input-label">Test ke Email Tertentu (opsional)</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@test.com"
                className="input-field flex-1"
              />
              <button
                onClick={() => send(true)}
                disabled={sending || !testEmail.trim()}
                className="btn-secondary px-4 flex items-center gap-2 text-xs disabled:opacity-40 whitespace-nowrap"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
                Kirim Test
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (!confirm(`Kirim newsletter ke ${subscriberCount} subscriber? Aksi ini tidak bisa dibatalkan.`)) return;
              send(false);
            }}
            disabled={sending || subscriberCount === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
              : <><Send className="w-4 h-4" /> Blast ke {subscriberCount} Subscriber</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

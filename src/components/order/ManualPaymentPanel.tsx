"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, CheckCircle2, XCircle, Clock, Copy, QrCode, Banknote, Loader2, ImageIcon, Wallet, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Bank    = { name: string; number: string; holder: string };
type EWallet = { name: string; number: string; holder: string };
type PaymentConfig = { banks: Bank[]; ewallets?: EWallet[]; qrisImageUrl: string; instructions: string } | null;

type Props = {
  orderId:          string;
  amount:           number;
  status:           string; // MANUAL_PENDING | WAITING_CONFIRMATION | SUCCESS | REJECTED
  paymentMethod?:   string; // TRANSFER | QRIS | EWALLET | MANUAL (legacy)
  rejectedReason?:  string | null;
  paymentDeadline?: string | null; // ISO string
};

export default function ManualPaymentPanel({ orderId, amount, status, paymentMethod, rejectedReason, paymentDeadline }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<PaymentConfig>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bank" | "ewallet" | "qris">("bank");
  const [confirmed, setConfirmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then(r => r.json())
      .then(({ data }) => {
        setConfig(data);
        // Auto-select tab sesuai metode pembayaran yang dipilih customer
        if (paymentMethod === "QRIS") {
          setActiveTab("qris");
        } else if (paymentMethod === "EWALLET") {
          setActiveTab("ewallet");
        } else if (paymentMethod === "TRANSFER") {
          setActiveTab("bank");
        } else if (data) {
          // Fallback: pilih tab pertama yang tersedia
          if (data.banks?.length > 0) setActiveTab("bank");
          else if (data.ewallets?.length > 0) setActiveTab("ewallet");
          else if (data.qrisImageUrl) setActiveTab("qris");
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} disalin`));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))  { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024)     { toast.error("Ukuran file maks 5MB"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        setPreview(compressed);
        setImageBase64(compressed);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const submitProof = async () => {
    if (!imageBase64) { toast.error("Pilih gambar bukti transfer terlebih dahulu"); return; }
    setUploading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Gagal mengirim bukti"); return; }
      toast.success("Bukti transfer berhasil dikirim! Menunggu konfirmasi admin.");
      setPreview(null);
      setImageBase64(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  // ── Status banners ──────────────────────────────────────
  if (status === "SUCCESS") {
    return (
      <div className="bg-brand-gray-900 border border-green-800 p-5">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Pembayaran Dikonfirmasi</p>
            <p className="text-xs text-green-400/70 mt-0.5">Pesananmu sedang diproses oleh penjual.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "WAITING_CONFIRMATION") {
    return (
      <div className="bg-brand-gray-900 border border-yellow-800 p-5">
        <div className="flex items-center gap-3 text-yellow-400">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Bukti Transfer Dikirim — Menunggu Konfirmasi</p>
            <p className="text-xs text-yellow-400/70 mt-0.5">Admin akan mengonfirmasi pembayaranmu dalam 1×24 jam.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-brand-gray-500" />
      </div>
    );
  }

  const hasBank    = config?.banks && config.banks.length > 0;
  const hasEWallet = config?.ewallets && config.ewallets.length > 0;
  const hasQris    = !!config?.qrisImageUrl;

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Banknote className="w-4 h-4" /> Instruksi Pembayaran
        </h2>
        <span className="text-xs font-bold font-mono text-white bg-brand-gray-800 px-2 py-1">
          {formatPrice(amount)}
        </span>
      </div>

      {/* Payment deadline warning */}
      {paymentDeadline && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-xs text-red-400">⏰ Bayar sebelum <strong>{new Date(paymentDeadline).toLocaleString("id-ID")}</strong></p>
          <p className="text-[10px] text-red-400/70 mt-0.5">Pesanan otomatis dibatalkan jika melewati batas waktu</p>
        </div>
      )}

      {/* Peringatan utama sebelum bayar */}
      <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/40">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Perhatikan Sebelum Transfer!</p>
          <ul className="text-[11px] text-red-300/80 space-y-0.5 leading-relaxed">
            <li>• Pastikan <strong>nomor tujuan</strong> sesuai dengan yang tertera di bawah</li>
            <li>• Pastikan <strong>nominal transfer tepat</strong> — lebih atau kurang 1 rupiah pun akan ditolak sistem</li>
            <li>• Kesalahan transfer adalah <strong>tanggung jawab pembeli</strong></li>
          </ul>
        </div>
      </div>

      {/* Rejected banner */}
      {status === "REJECTED" && (
        <div className="flex items-start gap-3 p-3 border border-red-800 bg-red-900/20">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Bukti Transfer Ditolak</p>
            {rejectedReason && <p className="text-xs text-red-400/70 mt-0.5">{rejectedReason}</p>}
            <p className="text-xs text-brand-gray-400 mt-1">Silakan unggah ulang bukti yang benar.</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {config?.instructions && (
        <p className="text-xs text-brand-gray-400 leading-relaxed border-l-2 border-brand-gray-700 pl-3">
          {config.instructions}
        </p>
      )}

      {/* Tab switcher — hanya tampil jika ada lebih dari 1 kategori */}
      {[hasBank, hasEWallet, hasQris].filter(Boolean).length > 1 && (
        <div className="flex border border-brand-gray-700">
          {hasBank && (
            <button onClick={() => setActiveTab("bank")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === "bank" ? "bg-white text-black" : "text-brand-gray-400 hover:text-white"}`}>
              <Banknote className="w-3.5 h-3.5" /> Virtual Account
            </button>
          )}
          {hasEWallet && (
            <button onClick={() => setActiveTab("ewallet")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === "ewallet" ? "bg-white text-black" : "text-brand-gray-400 hover:text-white"}`}>
              <Wallet className="w-3.5 h-3.5" /> E-Wallet
            </button>
          )}
          {hasQris && (
            <button onClick={() => setActiveTab("qris")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === "qris" ? "bg-white text-black" : "text-brand-gray-400 hover:text-white"}`}>
              <QrCode className="w-3.5 h-3.5" /> QRIS
            </button>
          )}
        </div>
      )}

      {/* Bank accounts */}
      {activeTab === "bank" && hasBank && (
        <div className="space-y-3">
          {/* Panduan ketat transfer */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Perhatian Sebelum Transfer
            </p>
            <ul className="text-[11px] text-amber-300/80 space-y-1 leading-relaxed">
              <li>• Transfer hanya ke <strong>nomor Virtual Account</strong> di bawah — bukan rekening biasa</li>
              <li>• Nominal transfer harus <strong>tepat {formatPrice(amount)}</strong> — tidak boleh lebih/kurang</li>
              <li>• Upload foto bukti transfer yang <strong>jelas & tidak buram</strong></li>
            </ul>
          </div>

          {config!.banks.map((bank, i) => (
            <div key={i} className="border border-brand-gray-700 overflow-hidden">
              {/* Bank header */}
              <div className="bg-brand-gray-700 px-4 py-2 flex items-center gap-2">
                <Banknote className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">{bank.name}</span>
                <span className="ml-auto text-[10px] text-brand-gray-400 uppercase tracking-widest">Virtual Account</span>
              </div>
              <div className="p-4 bg-brand-gray-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest">No. Virtual Account</p>
                    <p className="font-mono font-bold text-xl tracking-widest mt-0.5">{bank.number}</p>
                    <p className="text-xs text-brand-gray-400 mt-0.5">a.n. {bank.holder}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => copyToClipboard(bank.number, `No. VA ${bank.name}`)}
                            className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                      <Copy className="w-3 h-3" /> Salin No. VA
                    </button>
                    <button onClick={() => copyToClipboard(String(amount), "Nominal")}
                            className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                      <Copy className="w-3 h-3" /> Salin Nominal
                    </button>
                  </div>
                </div>
                <div className="pt-3 border-t border-brand-gray-700 flex items-center justify-between">
                  <p className="text-[10px] text-brand-gray-500">Nominal yang harus ditransfer</p>
                  <p className="font-mono font-bold text-white text-sm">{formatPrice(amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* E-Wallet */}
      {activeTab === "ewallet" && hasEWallet && (
        <div className="space-y-4">
          {/* Step-by-step guide */}
          <div className="flex items-start gap-3 p-3 bg-brand-gray-800 border border-brand-gray-700">
            <Wallet className="w-4 h-4 text-brand-gray-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-[11px] text-brand-gray-400 leading-relaxed">
              <p><span className="text-white font-bold">1.</span> Buka aplikasi e-wallet kamu (GoPay, DANA, OVO, dll)</p>
              <p><span className="text-white font-bold">2.</span> Pilih "Transfer" → masukkan nomor di bawah</p>
              <p><span className="text-white font-bold">3.</span> Masukkan nominal <span className="text-white font-bold font-mono">{formatPrice(amount)}</span> (harus tepat)</p>
              <p><span className="text-white font-bold">4.</span> Screenshot bukti transfer → upload di bawah</p>
            </div>
          </div>

          {/* Wallet cards */}
          {config!.ewallets!.map((ew, i) => {
            const walletColor: Record<string, string> = {
              gopay:     "bg-green-500",
              goPay:     "bg-green-500",
              GoPay:     "bg-green-500",
              dana:      "bg-blue-500",
              Dana:      "bg-blue-500",
              DANA:      "bg-blue-500",
              ovo:       "bg-purple-600",
              OVO:       "bg-purple-600",
              shopee:    "bg-orange-500",
              shopeepay: "bg-orange-500",
              ShopeePay: "bg-orange-500",
              linkaja:   "bg-red-500",
              LinkAja:   "bg-red-500",
            };
            const color = walletColor[ew.name] ?? walletColor[ew.name.toLowerCase()] ?? "bg-brand-gray-700";
            return (
              <div key={i} className="border border-brand-gray-700 overflow-hidden">
                {/* Wallet header */}
                <div className={`${color} px-4 py-2 flex items-center gap-2`}>
                  <Wallet className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{ew.name}</span>
                </div>
                {/* Wallet body */}
                <div className="p-4 bg-brand-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest">Nomor {ew.name}</p>
                      <p className="font-mono font-bold text-xl tracking-widest mt-0.5">{ew.number}</p>
                      <p className="text-xs text-brand-gray-400 mt-0.5">a.n. {ew.holder}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => copyToClipboard(ew.number, `No. ${ew.name}`)}
                              className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                        <Copy className="w-3 h-3" /> Salin No.
                      </button>
                      <button onClick={() => copyToClipboard(String(amount), `Nominal`)}
                              className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                        <Copy className="w-3 h-3" /> Salin Nominal
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-brand-gray-700 flex items-center justify-between">
                    <p className="text-[10px] text-brand-gray-500">Nominal transfer</p>
                    <p className="font-mono font-bold text-white">{formatPrice(amount)}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-[10px] text-amber-400/80 text-center flex items-center justify-center gap-1">
            ⚠ Transfer harus tepat sesuai nominal — pembayaran tidak akan terkonfirmasi jika berbeda
          </p>
        </div>
      )}

      {/* QRIS */}
      {activeTab === "qris" && (
        hasQris ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-4 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config!.qrisImageUrl} alt="QRIS" className="max-w-[220px] max-h-[220px] object-contain" />
              <p className="text-[11px] text-black font-bold uppercase tracking-wider">Scan QR untuk Bayar</p>
            </div>
            <div className="p-3 bg-brand-gray-800 border border-brand-gray-700 space-y-1">
              <p className="text-[11px] text-brand-gray-400 leading-relaxed">
                <span className="text-white font-bold">1.</span> Buka aplikasi e-wallet atau m-banking kamu<br />
                <span className="text-white font-bold">2.</span> Pilih fitur Scan QR / QRIS<br />
                <span className="text-white font-bold">3.</span> Scan kode QR di atas<br />
                <span className="text-white font-bold">4.</span> Masukkan nominal <span className="font-bold font-mono text-white">{formatPrice(amount)}</span> (harus tepat)<br />
                <span className="text-white font-bold">5.</span> Screenshot bukti pembayaran → upload di bawah
              </p>
            </div>
            <p className="text-[10px] text-amber-400/80 text-center flex items-center justify-center gap-1">
              ⚠ Pastikan nominal tepat — pembayaran tidak akan terkonfirmasi jika berbeda
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center border border-brand-gray-800">
            <QrCode className="w-8 h-8 text-brand-gray-700" />
            <p className="text-sm font-semibold text-brand-gray-500">QRIS belum dikonfigurasi</p>
            <p className="text-xs text-brand-gray-600 max-w-xs">Gunakan Transfer Bank atau E-Wallet sebagai alternatif.</p>
          </div>
        )
      )}

      {/* Fallback jika hanya 1 kategori — auto-show tanpa tab */}
      {!hasBank && !hasEWallet && !hasQris && (
        <p className="text-sm text-brand-gray-500 text-center py-4">
          Info rekening/QRIS belum diisi admin. Hubungi penjual via WhatsApp.
        </p>
      )}


      {/* Konfirmasi wajib sebelum upload */}
      <div className="border-t border-brand-gray-700 pt-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`w-5 h-5 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${confirmed ? "bg-white border-white" : "border-brand-gray-600 group-hover:border-brand-gray-400"}`}
               onClick={() => setConfirmed(v => !v)}>
            {confirmed && <ShieldCheck className="w-3.5 h-3.5 text-black" />}
          </div>
          <span className="text-[11px] text-brand-gray-400 leading-relaxed">
            Saya menyatakan telah mentransfer sebesar{" "}
            <span className="font-bold text-white font-mono">{formatPrice(amount)}</span>{" "}
            ke nomor yang tertera di atas, dan bukti transfer yang saya upload adalah asli dan jelas.
          </span>
        </label>

        {!confirmed && (
          <p className="text-[10px] text-brand-gray-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Centang pernyataan di atas untuk mengaktifkan upload bukti pembayaran.
          </p>
        )}
      </div>

      {/* Upload proof */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest">Upload Bukti Pembayaran</p>

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
               onChange={handleFileChange} />

        {preview ? (
          <div className="space-y-3">
            <div className="relative border border-brand-gray-700 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-brand-gray-950" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPreview(null); setImageBase64(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 px-3 py-1.5 transition-colors">
                Ganti Gambar
              </button>
              <button onClick={submitProof} disabled={uploading || !confirmed}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => confirmed ? fileRef.current?.click() : toast.error("Centang pernyataan konfirmasi terlebih dahulu")}
            className={`w-full border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors ${confirmed ? "border-brand-gray-700 hover:border-white cursor-pointer" : "border-brand-gray-800 cursor-not-allowed opacity-40"}`}
          >
            <ImageIcon className="w-8 h-8 text-brand-gray-600" />
            <span className="text-sm text-brand-gray-400">Klik untuk pilih foto bukti transfer</span>
            <span className="text-xs text-brand-gray-600">JPG, PNG — maks 5MB</span>
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, CheckCircle2, XCircle, Clock, Copy, QrCode, Banknote, Loader2, ImageIcon, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Bank    = { name: string; number: string; holder: string };
type EWallet = { name: string; number: string; holder: string };
type PaymentConfig = { banks: Bank[]; ewallets?: EWallet[]; qrisImageUrl: string; instructions: string } | null;

type Props = {
  orderId:       string;
  amount:        number;
  status:        string; // MANUAL_PENDING | WAITING_CONFIRMATION | SUCCESS | REJECTED
  paymentMethod?: string; // TRANSFER | QRIS | EWALLET | MANUAL (legacy)
  rejectedReason?: string | null;
};

export default function ManualPaymentPanel({ orderId, amount, status, paymentMethod, rejectedReason }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<PaymentConfig>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bank" | "ewallet" | "qris">("bank");
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
          {config!.banks.map((bank, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-brand-gray-800">
              <div>
                <p className="text-xs text-brand-gray-500 uppercase tracking-widest">{bank.name}</p>
                <p className="font-mono font-bold text-lg tracking-widest mt-0.5">{bank.number}</p>
                <p className="text-xs text-brand-gray-400">{bank.holder}</p>
              </div>
              <button onClick={() => copyToClipboard(bank.number, `No. VA ${bank.name}`)}
                      className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                <Copy className="w-3 h-3" /> Salin
              </button>
            </div>
          ))}
        </div>
      )}

      {/* E-Wallet */}
      {activeTab === "ewallet" && hasEWallet && (
        <div className="space-y-3">
          {config!.ewallets!.map((ew, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-brand-gray-800">
              <div>
                <p className="text-xs text-brand-gray-500 uppercase tracking-widest font-bold">{ew.name}</p>
                <p className="font-mono font-bold text-lg tracking-widest mt-0.5">{ew.number}</p>
                <p className="text-xs text-brand-gray-400">{ew.holder}</p>
              </div>
              <button onClick={() => copyToClipboard(ew.number, `No. ${ew.name}`)}
                      className="flex items-center gap-1.5 text-xs text-brand-gray-400 hover:text-white border border-brand-gray-600 hover:border-white px-3 py-1.5 transition-colors">
                <Copy className="w-3 h-3" /> Salin
              </button>
            </div>
          ))}
          <p className="text-[10px] text-brand-gray-600 text-center">
            Buka aplikasi e-wallet → kirim ke nomor di atas → upload bukti pembayaran
          </p>
        </div>
      )}

      {/* QRIS */}
      {activeTab === "qris" && hasQris && (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-xs text-brand-gray-400">Scan QR dengan aplikasi e-wallet / m-banking apapun</p>
          <div className="p-4 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={config!.qrisImageUrl} alt="QRIS" className="w-48 h-48 object-contain" />
          </div>
          <p className="text-xs text-brand-gray-500">Pastikan nominal sesuai: <span className="text-white font-bold">{formatPrice(amount)}</span></p>
        </div>
      )}

      {/* Fallback jika hanya 1 kategori — auto-show tanpa tab */}
      {!hasBank && !hasEWallet && !hasQris && (
        <p className="text-sm text-brand-gray-500 text-center py-4">
          Info rekening/QRIS belum diisi admin. Hubungi penjual via WhatsApp.
        </p>
      )}


      {/* Upload proof */}
      <div className="border-t border-brand-gray-700 pt-4 space-y-3">
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
              <button onClick={submitProof} disabled={uploading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-brand-gray-700 hover:border-white transition-colors py-8 flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8 text-brand-gray-600" />
            <span className="text-sm text-brand-gray-400">Klik untuk pilih foto bukti transfer</span>
            <span className="text-xs text-brand-gray-600">JPG, PNG — maks 5MB</span>
          </button>
        )}
      </div>
    </div>
  );
}

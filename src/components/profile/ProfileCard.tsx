"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import { RankBadge, LoyaltyBadge } from "./RankBadge";
import { RANK_MAP, nextRank, rankProgress, type RankKey } from "@/lib/rank";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type Props = {
  name:        string;
  email:       string;
  phone?:      string | null;
  avatar?:     string | null;
  rank:        string;
  totalSpend:  number;
  orderCount:  number;
  memberSince: string;
};

export default function ProfileCard(props: Props) {
  const [avatar, setAvatar]       = useState(props.avatar ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rank    = (props.rank ?? "BRONZE") as RankKey;
  const cfg     = RANK_MAP[rank] ?? RANK_MAP["BRONZE"];
  const next    = nextRank(rank);
  const prog    = rankProgress(props.totalSpend, rank);
  const isLoyal = props.orderCount >= 2;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error("Ukuran maks 5MB"); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX = 400;
        let { width: w, height: h } = img;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL("image/jpeg", 0.8);

        try {
          const res  = await fetch("/api/profile/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: b64 }),
          });
          if (!res.ok) throw new Error();
          setAvatar(b64);
          toast.success("Foto profil diperbarui!");
        } catch {
          toast.error("Gagal mengupload foto");
        } finally {
          setUploading(false);
          if (fileRef.current) fileRef.current.value = "";
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  async function removeAvatar() {
    setUploading(true);
    try {
      await fetch("/api/profile/avatar", { method: "DELETE" });
      setAvatar(null);
      toast.success("Foto profil dihapus");
    } catch {
      toast.error("Gagal menghapus foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden mb-6">

      {/* Rank banner header */}
      <div className={`bg-gradient-to-r ${cfg.bgClass} px-6 py-4 flex items-center justify-between`}>
        <div>
          <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Level Member</p>
          <p className="text-white text-2xl font-display tracking-widest uppercase font-bold">{cfg.label}</p>
        </div>
        <span className="text-5xl">{cfg.icon}</span>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0 group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gray-600 bg-brand-gray-800 flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt={props.name} className="w-full h-full object-cover" />
                : <User className="w-8 h-8 text-brand-gray-500" />}
            </div>
            {/* Overlay upload button */}
            <button
              type="button"
              onClick={() => !uploading && fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
            >
              {uploading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </button>
            {/* Remove button */}
            {avatar && !uploading && (
              <button
                onClick={removeAvatar}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus foto"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-bold text-lg leading-tight">{props.name}</p>
              <RankBadge rank={rank} size="sm" />
              {isLoyal && <LoyaltyBadge size="sm" />}
            </div>
            <p className="text-sm text-brand-gray-400">{props.email}</p>
            {props.phone && <p className="text-xs text-brand-gray-500 mt-0.5">{props.phone}</p>}
            <p className="text-xs text-brand-gray-600 mt-1">Member sejak {props.memberSince}</p>
          </div>
        </div>

        {/* Rank progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${cfg.textClass}`}>Total Belanja</span>
            <span className="font-bold text-white">{formatPrice(props.totalSpend)}</span>
          </div>

          {next ? (
            <>
              <div className="w-full h-2 bg-brand-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cfg.bgClass} transition-all duration-500`}
                  style={{ width: `${prog}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-brand-gray-500">
                <span>{cfg.icon} {cfg.label}</span>
                <span>
                  {formatPrice(next.minSpend - props.totalSpend)} lagi → {next.icon} {next.label}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gradient-to-r from-cyan-700 to-cyan-400 rounded-full" />
              <span className="text-[10px] text-cyan-400 font-bold">Level Tertinggi 🎉</span>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-4 p-3 rounded-none border border-brand-gray-700 bg-brand-gray-800">
          <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest mb-1">Keuntungan Level-mu</p>
          <p className={`text-sm font-semibold ${cfg.textClass}`}>{cfg.description}</p>
        </div>
      </div>
    </div>
  );
}

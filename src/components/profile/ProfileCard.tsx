"use client";

import { useRef, useState } from "react";
import {
  Camera, Loader2, User, X, Pencil, Check,
  Phone, Instagram, Mail, Lock, Eye, EyeOff,
} from "lucide-react";
import { RankBadge, LoyaltyBadge } from "./RankBadge";
import RankIcon from "./RankIcon";
import { RANK_MAP, nextRank, rankProgress, type RankKey } from "@/lib/rank";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type Props = {
  name:        string;
  email:       string;
  phone?:      string | null;
  instagram?:  string | null;
  avatar?:     string | null;
  rank:        string;
  totalSpend:  number;
  orderCount:  number;
  memberSince: string;
};

export default function ProfileCard(props: Props) {
  const [avatar,    setAvatar]    = useState(props.avatar    ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Edit profile state ─────────────────────────────────────
  const [editOpen,  setEditOpen]  = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name:      props.name      ?? "",
    phone:     props.phone     ?? "",
    instagram: props.instagram ?? "",
  });

  // ── Change password state ──────────────────────────────────
  const [pwOpen,   setPwOpen]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const rank = (props.rank ?? "BRONZE") as RankKey;
  const cfg  = RANK_MAP[rank] ?? RANK_MAP["BRONZE"];
  const next = nextRank(rank);
  const prog = rankProgress(props.totalSpend, rank);
  const isLoyal = props.orderCount >= 2;

  // ── Avatar upload ──────────────────────────────────────────
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
          const res = await fetch("/api/profile/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: b64 }),
          });
          if (!res.ok) throw new Error();
          setAvatar(b64);
          toast.success("Foto profil diperbarui");
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

  // ── Save profile ───────────────────────────────────────────
  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      toast.success("Profil diperbarui");
      setEditOpen(false);
      // Update display without reload
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Change password ────────────────────────────────────────
  async function changePassword() {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword:     pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengganti password");
      toast.success("Password berhasil diubah");
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden mb-6">

      {/* Rank banner */}
      <div className={`bg-gradient-to-r ${cfg.bgClass} px-6 py-4 flex items-center justify-between`}>
        <div>
          <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Level Member</p>
          <p className="text-white text-2xl font-display tracking-widest uppercase font-bold">{cfg.label}</p>
        </div>
        <RankIcon rank={rank} size={56} />
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
            <div className="space-y-0.5">
              <p className="text-sm text-brand-gray-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 flex-shrink-0" /> {props.email}
              </p>
              {props.phone && (
                <p className="text-xs text-brand-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 flex-shrink-0" /> {props.phone}
                </p>
              )}
              {props.instagram && (
                <p className="text-xs text-brand-gray-500 flex items-center gap-1.5">
                  <Instagram className="w-3 h-3 flex-shrink-0" /> @{props.instagram}
                </p>
              )}
            </div>
            <p className="text-xs text-brand-gray-600 mt-1">Member sejak {props.memberSince}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => { setEditOpen(!editOpen); setPwOpen(false); }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 border border-brand-gray-600 hover:border-white hover:text-white text-brand-gray-400 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit Profil
          </button>
          <button
            type="button"
            onClick={() => { setPwOpen(!pwOpen); setEditOpen(false); }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 border border-brand-gray-600 hover:border-white hover:text-white text-brand-gray-400 transition-colors"
          >
            <Lock className="w-3 h-3" /> Ganti Password
          </button>
        </div>

        {/* ── Edit Profile Form ─────────────────────────────── */}
        {editOpen && (
          <div className="mt-4 border border-brand-gray-700 p-4 space-y-3 bg-brand-gray-800">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Edit Profil</p>

            <div>
              <label className="input-label flex items-center gap-1.5"><User className="w-3 h-3" /> Nama</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="input-label flex items-center gap-1.5"><Phone className="w-3 h-3" /> Nomor HP</label>
              <input
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field"
                placeholder="08xxxxxxxxxx"
                type="tel"
              />
            </div>

            <div>
              <label className="input-label flex items-center gap-1.5">
                <Instagram className="w-3 h-3" /> Instagram <span className="text-brand-gray-600">(opsional)</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 border border-r-0 border-brand-gray-600 bg-brand-gray-700 text-brand-gray-400 text-sm select-none">@</span>
                <input
                  value={editForm.instagram}
                  onChange={(e) => setEditForm((p) => ({ ...p, instagram: e.target.value.replace(/^@/, "") }))}
                  className="input-field flex-1"
                  placeholder="username_ig"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingProfile
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Check className="w-3 h-3" />}
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ── Change Password Form ──────────────────────────── */}
        {pwOpen && (
          <div className="mt-4 border border-brand-gray-700 p-4 space-y-3 bg-brand-gray-800">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400">Ganti Password</p>

            <div>
              <label className="input-label">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={showCur ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCur(!showCur)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white"
                  tabIndex={-1}
                >
                  {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Password Baru</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="Min. 8 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="input-field"
                placeholder="Ulangi password baru"
                autoComplete="new-password"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={changePassword}
                disabled={savingPw}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingPw
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Check className="w-3 h-3" />}
                Simpan Password
              </button>
              <button
                type="button"
                onClick={() => setPwOpen(false)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Rank progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${cfg.textClass}`}>Total Belanja</span>
            <span className="font-bold text-white">{formatPrice(props.totalSpend)}</span>
          </div>
          {next ? (
            <>
              <div className="w-full h-2 bg-brand-gray-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${cfg.bgClass} transition-all duration-500`} style={{ width: `${prog}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-brand-gray-500 items-center">
                <span className="flex items-center gap-1"><RankIcon rank={rank} size={12} /> {cfg.label}</span>
                <span className="flex items-center gap-1">
                  {formatPrice(next.minSpend - props.totalSpend)} lagi →
                  <RankIcon rank={next.key} size={12} /> {next.label}
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
        <div className="mt-4 p-3 border border-brand-gray-700 bg-brand-gray-800">
          <p className="text-[10px] text-brand-gray-500 uppercase tracking-widest mb-1">Keuntungan level-mu</p>
          <p className={`text-sm font-semibold ${cfg.textClass}`}>{cfg.description}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  userId: string;
  isActive: boolean;
  role: string;
}

export default function AdminUserActions({ userId, isActive, role }: Props) {
  const router = useRouter();

  const toggleStatus = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui");
      toast.success(isActive ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan");
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui pengguna");
    }
  };

  return (
    <button
      onClick={toggleStatus}
      className={`text-xs px-3 py-1.5 font-medium transition-colors ${
        isActive
          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
          : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
      }`}
    >
      {isActive ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}

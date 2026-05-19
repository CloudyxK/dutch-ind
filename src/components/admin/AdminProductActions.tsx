"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  productSlug: string;
}

export default function AdminProductActions({ productId, productSlug }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Hapus produk ini?")) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Produk dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="p-2 hover:bg-brand-gray-700 transition-colors text-brand-gray-400 hover:text-white"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-brand-gray-700 transition-colors text-brand-gray-400 hover:text-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

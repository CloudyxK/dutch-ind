import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display tracking-widest uppercase text-white">Pengguna</h1>

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
              {["Nama", "Email", "HP", "Role", "Pesanan", "Daftar", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-brand-gray-800/50 transition-colors">
                <td className="p-4">
                  <p className="text-sm font-medium">{user.name}</p>
                </td>
                <td className="p-4 text-sm text-brand-gray-400">{user.email}</td>
                <td className="p-4 text-sm text-brand-gray-400">
                  {user.phone || "—"}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 ${
                      user.role === "ADMIN"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-brand-gray-800 text-brand-gray-400"
                    }`}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Customer"}
                  </span>
                </td>
                <td className="p-4 text-sm">{user._count.orders}</td>
                <td className="p-4 text-xs text-brand-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 ${
                      user.isActive
                        ? "bg-green-900/30 text-green-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-4">
                  <AdminUserActions userId={user.id} isActive={user.isActive} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

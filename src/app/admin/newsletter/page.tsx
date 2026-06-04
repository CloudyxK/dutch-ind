import prisma from "@/lib/prisma";
import Link from "next/link";
import NewsletterBlastForm from "./NewsletterBlastForm";

export const metadata = { title: "Newsletter — Admin" };

async function getSubscribers(): Promise<string[]> {
  const row = await prisma.setting.findUnique({ where: { key: "newsletter.subscribers" } });
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {}
  return [];
}

export default async function AdminNewsletterPage() {
  const subscribers = await getSubscribers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.28)" }}>Admin</span>
          </div>
          <h1 className="text-3xl font-display tracking-widest uppercase text-white">Newsletter</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-gray-500">{subscribers.length} subscriber</span>
          <Link href="/api/admin/newsletter/export" className="px-4 py-2 text-xs font-medium border border-brand-gray-700 text-brand-gray-300 hover:border-white hover:text-white transition-colors">
            Export CSV
          </Link>
        </div>
      </div>

      <NewsletterBlastForm subscriberCount={subscribers.length} />

      <div className="bg-brand-gray-900 border border-brand-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-gray-700">
          <h2 className="text-sm font-bold uppercase tracking-widest">Daftar Subscriber ({subscribers.length})</h2>
        </div>
        {subscribers.length === 0 ? (
          <div className="p-8 text-center text-brand-gray-500 text-sm">Belum ada subscriber newsletter</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-gray-700 bg-brand-gray-800">
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400 w-16">#</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-brand-gray-400">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-800">
              {subscribers.map((email, idx) => (
                <tr key={email} className="hover:bg-brand-gray-800/40 transition-colors">
                  <td className="p-4 text-xs text-brand-gray-600">{idx + 1}</td>
                  <td className="p-4 text-sm">{email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

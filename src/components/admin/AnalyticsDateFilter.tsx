"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

const PRESETS = [
  { label: "7 Hari", days: 7 },
  { label: "14 Hari", days: 14 },
  { label: "30 Hari", days: 30 },
  { label: "90 Hari", days: 90 },
];

export default function AnalyticsDateFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const activeDays = parseInt(sp.get("days") || "30");

  function setDays(d: number) {
    router.push(`/admin/analytics?days=${d}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="w-4 h-4 text-brand-gray-500" />
      <span className="text-xs text-brand-gray-500">Periode:</span>
      {PRESETS.map((p) => (
        <button
          key={p.days}
          onClick={() => setDays(p.days)}
          className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border transition-colors ${
            activeDays === p.days
              ? "border-white bg-white text-black"
              : "border-brand-gray-600 text-brand-gray-400 hover:border-white hover:text-white"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

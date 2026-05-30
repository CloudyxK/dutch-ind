"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface Props {
  deadline: string; // ISO date string
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { hours: "00", minutes: "00", seconds: "00", expired: true };
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours:   String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
    expired: false,
  };
}

export default function PaymentCountdown({ deadline }: Props) {
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(new Date(deadline).getTime() - Date.now())
  );

  useEffect(() => {
    const tick = () => {
      const remaining = new Date(deadline).getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isUrgent = !countdown.expired &&
    new Date(deadline).getTime() - Date.now() < 3 * 60 * 60 * 1000; // < 3 jam

  if (countdown.expired) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/30 text-center">
        <div className="flex items-center justify-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-sm font-bold">Batas waktu pembayaran habis</p>
        </div>
        <p className="text-xs text-red-400/70 mt-1">Pesanan akan segera dibatalkan secara otomatis.</p>
      </div>
    );
  }

  return (
    <div className={`p-3 border text-center ${isUrgent ? "bg-red-500/10 border-red-500/40" : "bg-amber-500/5 border-amber-500/20"}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className={`w-3.5 h-3.5 ${isUrgent ? "text-red-400" : "text-amber-400"}`} />
        <p className={`text-[10px] font-bold uppercase tracking-wider ${isUrgent ? "text-red-400" : "text-amber-400"}`}>
          Selesaikan pembayaran sebelum
        </p>
      </div>

      {/* Countdown display */}
      <div className="flex items-center justify-center gap-1.5">
        {[
          { value: countdown.hours,   label: "Jam" },
          { value: countdown.minutes, label: "Menit" },
          { value: countdown.seconds, label: "Detik" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center">
              <span className={`font-mono font-black text-2xl tabular-nums leading-none ${isUrgent ? "text-red-400" : "text-amber-400"}`}>
                {value}
              </span>
              <span className={`text-[8px] uppercase tracking-widest mt-0.5 ${isUrgent ? "text-red-400/50" : "text-amber-400/50"}`}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <span className={`font-mono font-bold text-xl pb-3 ${isUrgent ? "text-red-400/60" : "text-amber-400/40"}`}>:</span>
            )}
          </div>
        ))}
      </div>

      <p className={`text-[10px] mt-2 ${isUrgent ? "text-red-400/60" : "text-amber-400/50"}`}>
        Batas: {new Date(deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );
}

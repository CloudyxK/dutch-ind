"use client";

import { useState, useEffect } from "react";

interface Props {
  endAt: string; // ISO string
  className?: string;
}

export default function CountdownTimer({ endAt, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, d: 0 });

  useEffect(() => {
    setMounted(true);

    const endMs = new Date(endAt).getTime();

    const calc = () => {
      const diff = endMs - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTime({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      setTime({
        d: Math.floor(totalSec / 86400),
        h: Math.floor((totalSec % 86400) / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (!mounted) {
    // SSR placeholder — same layout to avoid layout shift
    return (
      <span className={className}>
        <span className="font-mono font-bold tracking-wider">--:--:--</span>
      </span>
    );
  }

  if (expired) {
    return (
      <span className={className}>
        <span className="font-mono font-bold tracking-wider text-red-400">Berakhir</span>
      </span>
    );
  }

  if (time.d > 0) {
    return (
      <span className={className}>
        <Seg value={pad(time.d)} label="H" />
        <Sep />
        <Seg value={pad(time.h)} label="J" />
        <Sep />
        <Seg value={pad(time.m)} label="M" />
        <Sep />
        <Seg value={pad(time.s)} label="D" />
      </span>
    );
  }

  return (
    <span className={className}>
      <Seg value={pad(time.h)} label="J" />
      <Sep />
      <Seg value={pad(time.m)} label="M" />
      <Sep />
      <Seg value={pad(time.s)} label="D" />
    </span>
  );
}

function Seg({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span className="font-mono font-bold text-white leading-none tabular-nums">{value}</span>
      <span className="text-[8px] uppercase tracking-widest text-white/30 leading-none mt-0.5">{label}</span>
    </span>
  );
}

function Sep() {
  return (
    <span className="font-bold text-white/30 mx-0.5 -mt-1 leading-none">:</span>
  );
}

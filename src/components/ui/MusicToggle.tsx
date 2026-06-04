"use client";

import { useEffect, useRef, useState } from "react";

const TRACK = "/music/ambient.mp3";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Skip on mobile — music toggle is pointless on touch devices and wastes memory
    if (window.innerWidth < 768 || navigator.maxTouchPoints > 0) return;
    setMounted(true);
    const audio = new Audio(TRACK);
    audio.loop   = true;
    audio.volume = 0.22;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try { await audio.play(); setPlaying(true); }
      catch { setPlaying(true); }
    }
  }

  if (!mounted) return null;

  return (
    // Desktop only — hidden on mobile via CSS too (belt-and-suspenders)
    <button
      onClick={toggle}
      aria-label={playing ? "Matikan musik" : "Putar musik"}
      className="hidden md:flex fixed bottom-24 left-5 z-40 items-center gap-2.5 px-3 py-2 bg-brand-black/90 border border-brand-gray-800 backdrop-blur-md hover:border-white/30 transition-colors duration-300 music-btn-enter"
    >
      {/* Waveform bars — CSS animation, no framer-motion */}
      <div className="flex items-end gap-[2px] h-4">
        {[0.45, 0.75, 1, 0.75, 0.45].map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-sm bg-white ${playing ? "music-bar-playing" : ""}`}
            style={{
              height: "100%",
              transformOrigin: "bottom",
              transform: `scaleY(${playing ? h : 0.25})`,
              transition: "transform 0.3s ease",
              animationDuration: playing ? `${0.9 + i * 0.12}s` : undefined,
              animationDelay: playing ? `${i * 0.1}s` : undefined,
            }}
          />
        ))}
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-[0.3em]"
        style={{ color: playing ? "#fff" : "rgba(255,255,255,0.4)" }}
      >
        {playing ? "LIVE" : "MUSIC"}
      </span>
      {playing && <span className="w-1.5 h-1.5 rounded-full bg-white music-dot-pulse" />}

      <style>{`
        .music-btn-enter { animation: musicFadeIn 0.6s ease 2.5s both; }
        @keyframes musicFadeIn { from { opacity:0; transform: translateX(-16px); } to { opacity:1; transform: translateX(0); } }
        .music-bar-playing { animation: barPulse var(--dur, 0.9s) ease-in-out infinite alternate; }
        @keyframes barPulse { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
        .music-dot-pulse { animation: dotPulse 1.4s ease-in-out infinite; }
        @keyframes dotPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.6); } }
      `}</style>
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Drop your ambient track at public/music/ambient.mp3 */
const TRACK = "/music/ambient.mp3";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
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
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        /* autoplay blocked — still flip UI */
        setPlaying(true);
      }
    }
  }

  if (!mounted) return null;

  return (
    <motion.button
      onClick={toggle}
      aria-label={playing ? "Matikan musik" : "Putar musik"}
      className="fixed bottom-24 left-5 z-40 flex items-center gap-2.5 px-3 py-2
                 bg-brand-black/90 border border-brand-gray-800 backdrop-blur-md
                 hover:border-white/30 transition-colors duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.5, duration: 0.6 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Animated waveform bars */}
      <div className="flex items-end gap-[2px] h-4">
        {[0.45, 0.75, 1, 0.75, 0.45].map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-sm bg-white"
            animate={
              playing
                ? {
                    scaleY: [h * 0.4, h, h * 0.6, h * 0.9, h * 0.4],
                    transition: {
                      duration: 0.9 + i * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
                : { scaleY: 0.25 }
            }
            style={{ originY: 1, height: "100%" }}
          />
        ))}
      </div>

      <span
        className="text-[9px] font-bold uppercase tracking-[0.3em]"
        style={{ color: playing ? "#fff" : "rgba(255,255,255,0.4)" }}
      >
        {playing ? "LIVE" : "MUSIC"}
      </span>

      <AnimatePresence>
        {playing && (
          <motion.span
            key="dot"
            className="w-1.5 h-1.5 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

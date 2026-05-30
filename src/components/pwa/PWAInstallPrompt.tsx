"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return null;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [platform, setPlatform]       = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner]   = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed]     = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const lastDismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // dismissed within 7 days
    }

    if (isStandalone()) return; // already installed

    const plat = detectPlatform();
    setPlatform(plat);

    // Android: catch beforeinstallprompt
    if (plat === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShowBanner(true), 3000); // show after 3s
      };
      window.addEventListener("beforeinstallprompt", handler as any);
      return () => window.removeEventListener("beforeinstallprompt", handler as any);
    }

    // iOS: always show guide (no install event on iOS)
    if (plat === "ios") {
      setTimeout(() => setShowBanner(true), 4000);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    setDismissed(true);
    localStorage.setItem("pwa_prompt_dismissed", String(Date.now()));
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  // iOS guide modal
  if (platform === "ios" && showIOSGuide) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-[#111111] border border-white/10 rounded-t-2xl p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Pasang di iPhone</h3>
            <button onClick={handleDismiss} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">1</div>
              <div>
                <p className="text-sm text-white font-medium">Tap tombol Share</p>
                <p className="text-xs text-white/50 mt-0.5">Tombol <Share className="inline w-3.5 h-3.5" /> di bagian bawah Safari</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">2</div>
              <div>
                <p className="text-sm text-white font-medium">Pilih "Tambah ke Layar Utama"</p>
                <p className="text-xs text-white/50 mt-0.5">Scroll ke bawah di menu share <Plus className="inline w-3 h-3" /></p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">3</div>
              <div>
                <p className="text-sm text-white font-medium">Tap "Tambah"</p>
                <p className="text-xs text-white/50 mt-0.5">Aplikasi DUTCH.IND muncul di Home Screen</p>
              </div>
            </div>
          </div>

          {/* Arrow pointing down for the share button */}
          <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
            <div className="w-full h-px bg-white/10" />
            <span className="whitespace-nowrap">Gratis, tanpa App Store</span>
            <div className="w-full h-px bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  // Banner (Android prompt + iOS initial banner)
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] max-w-sm mx-auto">
      <div className="bg-[#111111] border border-white/10 rounded-none shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0 rounded-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DUTCH.IND" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white">Install DUTCH.IND</p>
            <p className="text-[11px] text-white/50 mt-0.5">
              {platform === "android"
                ? "Tambahkan ke layar utama — gratis, tanpa App Store"
                : "Bisa diinstall langsung dari Safari"}
            </p>
          </div>

          <button onClick={handleDismiss} className="text-white/30 hover:text-white transition-colors flex-shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          {platform === "android" && deferredPrompt ? (
            <button
              onClick={handleInstallAndroid}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-white/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          ) : (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-white/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Cara Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="px-4 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
}

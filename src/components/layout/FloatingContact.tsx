"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Instagram } from "lucide-react";

type ContactConfig = {
  whatsapp:         string;
  whatsappMessage:  string;
  instagram:        string;
  tiktok:           string;
  email:            string;
  operationalHours: string;
} | null;

export default function FloatingContact() {
  const [config,  setConfig]  = useState<ContactConfig>(null);
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/contact")
      .then(r => r.json())
      .then(({ data }) => setConfig(data));
  }, []);

  if (!mounted || !config) return null;

  const hasWa = !!config.whatsapp;
  const hasIg = !!config.instagram;
  if (!hasWa && !hasIg) return null;

  const waHref = hasWa
    ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage || "")}`
    : null;
  const igHref = hasIg
    ? `https://instagram.com/${config.instagram}`
    : null;

  return (
    <div className="fixed right-4 sm:right-6 z-50 flex flex-col items-end gap-2" style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}>

      {/* Expanded options */}
      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}>

        {/* Info card */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 p-4 rounded-none w-64 shadow-2xl mb-1">
          <p className="text-xs font-bold uppercase tracking-widest mb-1">Customer Service</p>
          {config.operationalHours && (
            <p className="text-[10px] text-brand-gray-500 mb-3">{config.operationalHours}</p>
          )}
          <div className="space-y-2">
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                 onClick={() => setOpen(false)}
                 className="flex items-center gap-3 p-2.5 bg-green-900/30 border border-green-800/50 hover:bg-green-900/50 transition-colors group">
                <div className="w-7 h-7 bg-green-600 flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-400">WhatsApp</p>
                  <p className="text-[10px] text-brand-gray-500">Chat langsung dengan kami</p>
                </div>
              </a>
            )}
            {igHref && (
              <a href={igHref} target="_blank" rel="noopener noreferrer"
                 onClick={() => setOpen(false)}
                 className="flex items-center gap-3 p-2.5 bg-brand-gray-800 border border-brand-gray-700 hover:border-white transition-colors group">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold">Instagram</p>
                  <p className="text-[10px] text-brand-gray-500">@{config.instagram}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Customer Service"
        className="relative w-14 h-14 bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center"
        style={{ boxShadow: open ? "none" : "0 0 20px rgba(34,197,94,0.35)" }}
      >
        {/* Pulse ring — only when closed */}
        {!open && (
          <span className="absolute inset-0 animate-ping bg-green-500 opacity-20 rounded-none" />
        )}
        <span className={`transition-all duration-300 ${open ? "rotate-0 scale-100" : "rotate-0 scale-100"}`}>
          {open
            ? <X className="w-5 h-5" />
            : <WhatsAppIcon className="w-6 h-6" />
          }
        </span>
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

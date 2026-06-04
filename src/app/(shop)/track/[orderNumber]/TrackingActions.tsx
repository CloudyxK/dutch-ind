"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface Props {
  trackingNumber: string;
  carrierLink: string | null;
}

export default function TrackingActions({ trackingNumber, carrierLink }: Props) {
  const [copied, setCopied] = useState(false);

  function copyResi() {
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyResi}
        className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 border border-brand-gray-700 hover:border-white text-brand-gray-400 hover:text-white transition-colors"
        title="Salin nomor resi"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        {copied ? "Disalin!" : "Salin"}
      </button>
      {carrierLink && (
        <a
          href={carrierLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 border border-brand-gray-700 hover:border-white text-brand-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Cek di Kurir
        </a>
      )}
    </div>
  );
}

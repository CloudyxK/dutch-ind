"use client";

interface Props {
  originCity: string;
  destCity: string;
  carrierLabel?: string | null;
  trackingNumber: string;
  orderStatus: string;
  lastEvent?: string | null;
}

export default function FlightAnimation({
  originCity,
  destCity,
  carrierLabel,
  trackingNumber,
  orderStatus,
  lastEvent,
}: Props) {
  const isDelivered = orderStatus === "DELIVERED" || orderStatus === "COMPLETED";

  if (isDelivered) {
    return (
      <div className="relative overflow-hidden bg-[#030a04] p-6 flex items-center gap-5"
           style={{ border: "1px solid rgba(74,222,128,0.15)" }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(74,222,128,0.07) 0%, transparent 70%)" }}/>
        {/* Check icon */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
             style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="rgb(74,222,128)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="text-green-400 font-bold text-sm uppercase tracking-[0.15em]">Paket Terkirim</p>
          <p className="text-[10px] text-brand-gray-500 mt-1 uppercase tracking-wider">
            {originCity} → {destCity}
          </p>
          {lastEvent && (
            <p className="text-[10px] text-brand-gray-600 mt-0.5 truncate max-w-xs">{lastEvent}</p>
          )}
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-[9px] text-brand-gray-600 uppercase tracking-wider">Resi</p>
          <p className="font-mono text-xs text-brand-gray-400">{trackingNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{
      background: "linear-gradient(180deg, #05060f 0%, #080912 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Ambient glow from below */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 110%, rgba(99,102,241,0.06) 0%, transparent 70%)",
      }}/>

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          [8,12],[15,55],[22,30],[30,70],[38,18],[45,85],[52,40],[60,65],
          [68,25],[74,78],[82,48],[90,15],[96,60],[12,82],[35,50],[58,10],
          [78,90],[85,35],[25,95],[65,5],
        ].map(([x, y], i) => (
          <div key={i}
               className="absolute rounded-full bg-white"
               style={{
                 left: `${x}%`, top: `${y}%`,
                 width: i % 5 === 0 ? "2px" : "1px",
                 height: i % 5 === 0 ? "2px" : "1px",
                 opacity: 0.15 + (i % 4) * 0.08,
               }}/>
        ))}
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: "pulse-dot 2s ease-in-out infinite" }}/>
          <span className="text-[10px] text-brand-gray-400 uppercase tracking-[0.2em]">
            Dalam Perjalanan
          </span>
        </div>
        {carrierLabel && (
          <span className="text-[10px] text-brand-gray-600 uppercase tracking-[0.15em] font-bold">
            {carrierLabel}
          </span>
        )}
      </div>

      {/* SVG flight animation */}
      <div className="relative px-5 py-1">
        <svg viewBox="0 0 580 110" className="w-full overflow-visible" style={{ height: "auto" }}>
          <defs>
            {/* Hidden path for animateMotion */}
            <path id="arc-motion" d="M 30,90 Q 290,5 550,90"/>
            {/* Gradient for arc visibility */}
            <linearGradient id="arc-fade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="white" stopOpacity="0.06"/>
              <stop offset="30%"  stopColor="white" stopOpacity="0.35"/>
              <stop offset="50%"  stopColor="white" stopOpacity="0.5"/>
              <stop offset="70%"  stopColor="white" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="white" stopOpacity="0.06"/>
            </linearGradient>
          </defs>

          {/* Cloud 1 — left */}
          <g opacity="0.06" fill="white">
            <ellipse cx="115" cy="38" rx="28" ry="10"/>
            <ellipse cx="130" cy="32" rx="18" ry="8"/>
            <ellipse cx="103" cy="33" rx="14" ry="8"/>
          </g>

          {/* Cloud 2 — right */}
          <g opacity="0.05" fill="white">
            <ellipse cx="430" cy="28" rx="32" ry="11"/>
            <ellipse cx="450" cy="22" rx="20" ry="9"/>
            <ellipse cx="414" cy="23" rx="16" ry="9"/>
          </g>

          {/* Faint dotted arc */}
          <path d="M 30,90 Q 290,5 550,90"
                fill="none"
                stroke="url(#arc-fade)"
                strokeWidth="1.5"
                strokeDasharray="7 6"
                strokeLinecap="round"/>

          {/* Origin dot */}
          <circle cx="30" cy="90" r="3.5" fill="white" opacity="0.8"/>
          <circle cx="30" cy="90" r="7" fill="none" stroke="white" strokeWidth="0.8" opacity="0.2"/>

          {/* Destination pulsing rings */}
          <circle cx="550" cy="90" r="3.5" fill="white"/>
          <circle cx="550" cy="90" r="3.5" fill="none" stroke="white" strokeWidth="1.5">
            <animate attributeName="r"       values="3.5;24"  dur="2.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0"   dur="2.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="550" cy="90" r="3.5" fill="none" stroke="white" strokeWidth="1">
            <animate attributeName="r"       values="3.5;24"  dur="2.8s" begin="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0"   dur="2.8s" begin="1.4s" repeatCount="indefinite"/>
          </circle>

          {/* Animated plane along arc */}
          <g>
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              rotate="auto"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.3 0 0.7 1"
            >
              <mpath href="#arc-motion"/>
            </animateMotion>
            {/* Plane body (points right → rotate="auto" aligns with path tangent) */}
            {/* Fuselage */}
            <path d="M 11,0 L -4,-3.5 L -2,0 L -4,3.5 Z" fill="white"/>
            {/* Left wing */}
            <path d="M 3,-0.5 L -1,-10 L -4,-9 L 0.5,-0.5 Z" fill="white" opacity="0.9"/>
            {/* Right wing */}
            <path d="M 3,0.5 L -1,10 L -4,9 L 0.5,0.5 Z" fill="white" opacity="0.9"/>
            {/* Tail fin top */}
            <path d="M -2,-0.3 L -5,-7 L -6.5,-6 L -3,-0.3 Z" fill="white" opacity="0.7"/>
            {/* Tail fin bottom */}
            <path d="M -2,0.3 L -5,7 L -6.5,6 L -3,0.3 Z" fill="white" opacity="0.7"/>
            {/* Engine glow */}
            <circle cx="-1" cy="0" r="1.5" fill="rgba(255,255,255,0.3)"/>
          </g>
        </svg>
      </div>

      {/* City labels row */}
      <div className="relative flex justify-between items-end px-5 pb-4 -mt-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white leading-none">
            {originCity}
          </p>
          <p className="text-[9px] text-brand-gray-600 uppercase tracking-wider mt-0.5">Pengirim</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-brand-gray-700 font-mono">{trackingNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white leading-none">
            {destCity}
          </p>
          <p className="text-[9px] text-brand-gray-600 uppercase tracking-wider mt-0.5">Penerima</p>
        </div>
      </div>

      {/* Last event ticker */}
      {lastEvent && (
        <div className="relative border-t px-5 py-2.5"
             style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] text-brand-gray-500 truncate">{lastEvent}</p>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}

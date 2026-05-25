import type { RankKey } from "@/lib/rank";

type Props = { rank: RankKey | string; size?: number; className?: string };

// Bronze — Medali perisai dengan bintang
function BronzeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3L24.5 8H31L27.5 14L31 20L24.5 20.5L20 26L15.5 20.5L9 20L12.5 14L9 8H15.5L20 3Z"
        fill="#92400e" stroke="#b45309" strokeWidth="1.2"/>
      <path d="M20 3L24.5 8H31L27.5 14L31 20L24.5 20.5L20 26L15.5 20.5L9 20L12.5 14L9 8H15.5L20 3Z"
        fill="url(#bronzeGrad)"/>
      <path d="M20 8L22.5 12H27L24.5 16L26 20.5L20 18.5L14 20.5L15.5 16L13 12H17.5L20 8Z"
        fill="#fef3c7" opacity="0.25"/>
      <circle cx="20" cy="30" r="6" fill="#92400e" stroke="#b45309" strokeWidth="1.2"/>
      <circle cx="20" cy="30" r="6" fill="url(#bronzeGrad2)"/>
      <text x="20" y="34" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#fef3c7" fontFamily="sans-serif">B</text>
      <line x1="20" y1="26" x2="20" y2="24" stroke="#b45309" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="bronzeGrad" x1="9" y1="3" x2="31" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706"/>
          <stop offset="50%" stopColor="#92400e"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <linearGradient id="bronzeGrad2" x1="14" y1="24" x2="26" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Silver — Mahkota berlapis
function SilverIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28L8 14L14 20L20 8L26 20L32 14L34 28H6Z"
        fill="url(#silverGrad)" stroke="#94a3b8" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="6" y="28" width="28" height="5" rx="1" fill="url(#silverGrad2)" stroke="#94a3b8" strokeWidth="1"/>
      <circle cx="8" cy="14" r="2.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
      <circle cx="20" cy="8" r="2.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
      <circle cx="32" cy="14" r="2.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
      <path d="M10 28L12 18L20 24L28 18L30 28" fill="#e2e8f0" opacity="0.15"/>
      <defs>
        <linearGradient id="silverGrad" x1="6" y1="8" x2="34" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="40%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#475569"/>
        </linearGradient>
        <linearGradient id="silverGrad2" x1="6" y1="28" x2="34" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#475569"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Gold — Mahkota besar dengan batu permata
function GoldIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 30L7 13L14 21L20 6L26 21L33 13L35 30H5Z"
        fill="url(#goldGrad)" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="5" y="30" width="30" height="6" rx="1.5" fill="url(#goldGrad2)" stroke="#d97706" strokeWidth="1"/>
      {/* Gems on crown tips */}
      <circle cx="7"  cy="13" r="3" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1"/>
      <circle cx="20" cy="6"  r="3.5" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1"/>
      <circle cx="33" cy="13" r="3" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1"/>
      {/* Center gem */}
      <path d="M20 14L23 18H17L20 14Z" fill="#fef9c3"/>
      <path d="M17 18L20 26L23 18" fill="#fde68a"/>
      {/* Shine */}
      <path d="M8 30L12 18L20 23L28 18L32 30" fill="#fef9c3" opacity="0.2"/>
      <defs>
        <linearGradient id="goldGrad" x1="5" y1="6" x2="35" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="40%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="goldGrad2" x1="5" y1="30" x2="35" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Platinum — Perisai heksagonal elegan
function PlatinumIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer shield */}
      <path d="M20 2L36 9V22C36 30 20 38 20 38C20 38 4 30 4 22V9L20 2Z"
        fill="url(#platGrad)" stroke="#7c3aed" strokeWidth="1.2"/>
      {/* Inner shield highlight */}
      <path d="M20 6L32 12V22C32 28 20 34 20 34C20 34 8 28 8 22V12L20 6Z"
        fill="url(#platGrad2)" opacity="0.5"/>
      {/* Star/symbol in center */}
      <path d="M20 12L21.5 17H26.5L22.5 20L24 25L20 22L16 25L17.5 20L13.5 17H18.5L20 12Z"
        fill="#e9d5ff" stroke="#a855f7" strokeWidth="0.8"/>
      <defs>
        <linearGradient id="platGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd"/>
          <stop offset="40%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
        <linearGradient id="platGrad2" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede9fe"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Diamond — Berlian geometris
function DiamondIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Diamond facets */}
      <path d="M20 2L36 14L20 38L4 14L20 2Z" fill="url(#diaGrad)" stroke="#06b6d4" strokeWidth="1.2"/>
      {/* Top facet */}
      <path d="M20 2L36 14H4L20 2Z" fill="url(#diaGrad2)" stroke="#06b6d4" strokeWidth="0.8"/>
      {/* Inner facets */}
      <path d="M20 2L28 14H12L20 2Z" fill="#cffafe" opacity="0.3"/>
      <path d="M12 14L20 38L4 14H12Z" fill="#0891b2" opacity="0.4"/>
      <path d="M28 14L20 38L36 14H28Z" fill="#0e7490" opacity="0.5"/>
      <path d="M12 14H28L20 38L12 14Z" fill="url(#diaGrad3)"/>
      {/* Sparkle */}
      <line x1="20" y1="5"  x2="20" y2="9"  stroke="#cffafe" strokeWidth="1" opacity="0.8"/>
      <line x1="17" y1="6"  x2="21" y2="8"  stroke="#cffafe" strokeWidth="0.8" opacity="0.6"/>
      <line x1="23" y1="6"  x2="19" y2="8"  stroke="#cffafe" strokeWidth="0.8" opacity="0.6"/>
      <defs>
        <linearGradient id="diaGrad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc"/>
          <stop offset="40%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#0e7490"/>
        </linearGradient>
        <linearGradient id="diaGrad2" x1="4" y1="2" x2="36" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <linearGradient id="diaGrad3" x1="12" y1="14" x2="28" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee"/>
          <stop offset="100%" stopColor="#0369a1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RankIcon({ rank, size = 40, className = "" }: Props) {
  const r = (rank ?? "BRONZE").toString().toUpperCase();
  const props = { size };
  return (
    <span className={className} style={{ display: "inline-flex", lineHeight: 0 }}>
      {r === "BRONZE"   && <BronzeIcon   {...props} />}
      {r === "SILVER"   && <SilverIcon   {...props} />}
      {r === "GOLD"     && <GoldIcon     {...props} />}
      {r === "PLATINUM" && <PlatinumIcon {...props} />}
      {r === "DIAMOND"  && <DiamondIcon  {...props} />}
    </span>
  );
}

import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  { icon: Truck,       num: "01", title: "Gratis Ongkir",       desc: "Pembelian di atas Rp500.000 ke seluruh Indonesia" },
  { icon: Shield,      num: "02", title: "100% Original",       desc: "Semua produk bergaransi keaslian penuh" },
  { icon: RefreshCw,   num: "03", title: "Mudah Dikembalikan",  desc: "Pengembalian gratis dalam 14 hari" },
  { icon: Headphones,  num: "04", title: "Layanan 24/7",        desc: "Tim siap membantu kapan saja via chat" },
];

export default function BrandFeatures() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#060608", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.035 }} aria-hidden>
        <filter id="bf-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#bf-grain)"/>
      </svg>

      <div className="container-main relative z-10 py-16">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }}/>
          <span className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "rgba(255,255,255,0.2)" }}>
            Kenapa Dutch.Ind
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }}/>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, num, title, desc }, i) => (
            <div key={title}
                 className="group relative p-6 lg:p-8 transition-all duration-500"
                 style={{
                   borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                   borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                 }}>
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                   style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.025) 0%, transparent 70%)" }}/>

              {/* Number */}
              <p className="text-[10px] font-mono mb-5 transition-colors duration-300"
                 style={{ color: "rgba(255,255,255,0.15)" }}>
                {num}
              </p>

              {/* Icon */}
              <div className="mb-5 transition-transform duration-300 group-hover:-translate-y-0.5">
                <Icon className="w-5 h-5 transition-colors duration-300"
                      style={{ color: "rgba(255,255,255,0.5)" }}/>
              </div>

              {/* Text */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">{title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-6 right-6 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                   style={{ background: "rgba(255,255,255,0.15)" }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Gratis Ongkir",
    desc: "Untuk pembelian di atas Rp500.000 ke seluruh Indonesia",
  },
  {
    icon: Shield,
    title: "100% Original",
    desc: "Semua produk kami 100% original dan bergaransi resmi",
  },
  {
    icon: RefreshCw,
    title: "Mudah Dikembalikan",
    desc: "Pengembalian barang gratis dalam 14 hari setelah terima",
  },
  {
    icon: Headphones,
    title: "Customer Service 24/7",
    desc: "Tim kami siap membantu kamu kapan saja melalui chat",
  },
];

export default function BrandFeatures() {
  return (
    <section className="py-16 bg-brand-black border-y border-brand-gray-800">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 border border-brand-gray-700 flex items-center justify-center mb-4 group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
              <p className="text-xs text-brand-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

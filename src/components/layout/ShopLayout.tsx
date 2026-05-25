import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import FloatingContact from "./FloatingContact";
import SplashScreen from "./SplashScreen";
import AnnouncementTicker from "./AnnouncementTicker";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Entry splash — tampil setiap kunjungan */}
      <SplashScreen />

      {/* Watermark background — logo berulang di seluruh halaman */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: 0,
          backgroundImage: "url(/logo.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "180px auto",
          opacity: 0.04,
          mixBlendMode: "screen",
        }}
        aria-hidden
      />

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Ticker */}
        <AnnouncementTicker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <CartSidebar />
      <FloatingContact />
    </>
  );
}

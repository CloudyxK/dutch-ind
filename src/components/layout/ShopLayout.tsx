import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import FloatingContact from "./FloatingContact";
import BackToTop from "./BackToTop";
import AnnouncementTicker from "./AnnouncementTicker";
import PageTransition from "./PageTransition";
import ClientShopComponents from "./ClientShopComponents";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Heavy client-only components — lazy loaded via ClientShopComponents */}
      <ClientShopComponents />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo watermark — desktop only, hidden on mobile */}
        <div
          className="logo-watermark hidden md:block fixed inset-0 pointer-events-none select-none"
          style={{
            zIndex: 2,
            backgroundImage: "url(/logo.png)",
            backgroundRepeat: "repeat",
            backgroundSize: "175px auto",
            opacity: 0.11,
            mixBlendMode: "screen",
            filter: "brightness(5) contrast(3) saturate(0)",
          }}
          aria-hidden
        />

        <AnnouncementTicker />
        <Navbar />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <Footer />
      </div>

      <CartSidebar />
      <FloatingContact />
      <BackToTop />
    </>
  );
}

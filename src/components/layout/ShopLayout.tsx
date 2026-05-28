import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import FloatingContact from "./FloatingContact";
import SplashScreen from "./SplashScreen";
import AnnouncementTicker from "./AnnouncementTicker";
import CustomCursor from "@/components/ui/CustomCursor";
import MusicToggle from "@/components/ui/MusicToggle";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Custom cursor (desktop only, handled inside component) */}
      <CustomCursor />

      {/* Ambient music toggle */}
      <MusicToggle />

      {/* Entry splash — every visit */}
      <SplashScreen />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo watermark — overlaid above section backgrounds via mix-blend-mode */}
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
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <CartSidebar />
      <FloatingContact />
    </>
  );
}

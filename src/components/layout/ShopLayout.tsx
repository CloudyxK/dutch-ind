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

      {/* Logo watermark — repeating background */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: 0,
          backgroundImage: "url(/logo.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "180px auto",
          opacity: 0.035,
          mixBlendMode: "screen",
        }}
        aria-hidden
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
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

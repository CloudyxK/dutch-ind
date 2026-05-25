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

      {/* SVG circular brand watermark — like Hellstar repeating logo pattern */}
      <div
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 130 130'%3E%3Ccircle cx='65' cy='65' r='58' fill='none' stroke='white' stroke-width='0.7'/%3E%3Ccircle cx='65' cy='65' r='52' fill='none' stroke='white' stroke-width='0.3'/%3E%3Ctext x='65' y='60' text-anchor='middle' fill='white' font-family='Impact%2C sans-serif' font-size='17' letter-spacing='4'%3EDUTCH%3C/text%3E%3Ctext x='65' y='76' text-anchor='middle' fill='white' font-family='Impact%2C sans-serif' font-size='10' letter-spacing='5'%3E.IND%3C/text%3E%3Cline x1='30' y1='67' x2='50' y2='67' stroke='white' stroke-width='0.5'/%3E%3Cline x1='80' y1='67' x2='100' y2='67' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "130px 130px",
          opacity: 0.055,
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

import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import FloatingContact from "./FloatingContact";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FloatingContact />
    </>
  );
}

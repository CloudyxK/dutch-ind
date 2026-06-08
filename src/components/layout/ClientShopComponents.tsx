"use client";

import dynamic from "next/dynamic";

// Heavy client-only components — code-split so they don't block initial page render.
// ssr: false is required for Three.js (SplashScreen) and browser-API-only components.
const SplashScreen = dynamic(() => import("./SplashScreen"),                  { ssr: false });
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"),    { ssr: false });
const MusicToggle  = dynamic(() => import("@/components/ui/MusicToggle"),     { ssr: false });

export default function ClientShopComponents() {
  return (
    <>
      <SplashScreen />
      <CustomCursor />
      <MusicToggle />
    </>
  );
}

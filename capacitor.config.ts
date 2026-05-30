import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // ── Identitas App ────────────────────────────────────────────────────────────
  // appId: format reverse-domain (wajib unik di App Store)
  // Ganti "com.dutchind" jika kamu punya domain sendiri
  appId: "com.dutchind.app",
  appName: "DUTCH.IND",

  // ── Source: load dari URL produksi (paling simpel untuk Next.js) ─────────────
  // Capacitor akan membuka URL ini di WebView native
  server: {
    url: "https://dutch-indd.vercel.app", // ganti dengan URL Vercel kamu
    cleartext: false, // wajib false untuk produksi (HTTPS)
    androidScheme: "https",
    // allowNavigation: ["*.vercel.app"] // uncomment jika ada subdomain
  },

  // ── iOS spesifik ─────────────────────────────────────────────────────────────
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: false,
    scrollEnabled: true,
    // webContentsDebuggingEnabled: false, // set true saat dev untuk debug di Safari
  },

  // ── Plugin konfigurasi ────────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#050507",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#050507",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
  },
};

export default config;

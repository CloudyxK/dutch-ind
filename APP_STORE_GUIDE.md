# Panduan Submit DUTCH.IND ke App Store (iOS)

## Prasyarat

| Kebutuhan | Keterangan |
|-----------|-----------|
| **Mac** | Wajib — Xcode hanya bisa di macOS |
| **Xcode 15+** | Download gratis dari Mac App Store |
| **Apple Developer Account** | $99/tahun di [developer.apple.com](https://developer.apple.com) |
| **Node.js** | Sudah ada jika develop di Mac |
| **Cocoapods** | `sudo gem install cocoapods` |

---

## Langkah 1 — Clone & Install di Mac

```bash
git clone https://github.com/CloudyxK/dutch-ind.git
cd dutch-ind
npm install
```

## Langkah 2 — Edit URL di capacitor.config.ts

Buka `capacitor.config.ts` dan pastikan `server.url` mengarah ke URL Vercel kamu:

```ts
server: {
  url: "https://dutch-indd.vercel.app", // ← URL produksi kamu
}
```

## Langkah 3 — Tambah iOS platform

```bash
npx cap add ios
npx cap sync
```

Ini akan membuat folder `ios/` berisi project Xcode.

## Langkah 4 — Siapkan ikon & splash screen

Letakkan file-file ini di folder `ios/App/App/Assets.xcassets/`:
- **AppIcon.appiconset/** — ikon berbagai ukuran (gunakan [appicon.co](https://appicon.co))
- **Splash.imageset/** — splash screen

Atau gunakan plugin:
```bash
npm install @capacitor/splash-screen
npx cap sync
```

## Langkah 5 — Buka di Xcode

```bash
npm run cap:ios
# atau
npx cap open ios
```

Xcode akan terbuka dengan project `App.xcworkspace`.

## Langkah 6 — Konfigurasi di Xcode

1. **Signing & Capabilities** tab:
   - Team: Pilih Apple Developer Account kamu
   - Bundle Identifier: `com.dutchind.app`
   - Aktifkan "Automatically manage signing"

2. **Info tab**:
   - NSAppTransportSecurity → tambahkan domain Vercel jika perlu

3. **Build target**: Pilih "Any iOS Device (arm64)"

## Langkah 7 — Test di Simulator / Device

- Simulator: `Product → Run` (Cmd+R)
- Device fisik: Colok iPhone, pilih device, klik Run

## Langkah 8 — Buat App di App Store Connect

1. Buka [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps → + → New App**
3. Isi:
   - **Name**: DUTCH.IND
   - **Bundle ID**: com.dutchind.app
   - **SKU**: dutchind-ios-001
   - **Language**: Indonesian

## Langkah 9 — Archive & Upload

Di Xcode:
```
Product → Archive → Distribute App → App Store Connect → Upload
```

## Langkah 10 — Submit untuk Review

Di App Store Connect:
1. Isi deskripsi, screenshot, keywords
2. Screenshot wajib: iPhone 6.5" dan 5.5"
3. Submit → Review biasanya 1-3 hari kerja

---

## Tips agar Tidak Ditolak Apple

| ⚠️ Masalah Umum | ✅ Solusi |
|-----------------|----------|
| App hanya WebView tanpa nilai tambah | Pastikan ada fitur native (notif push, offline mode) |
| Tidak ada privacy policy | Tambahkan halaman /privacy dan link di App Store |
| Login via third-party tapi tidak ada "Sign in with Apple" | Tambahkan Sign in with Apple jika ada Google/FB login |
| Screenshot kurang bagus | Gunakan device frame dari [mockuphone.com](https://mockuphone.com) |

---

## Plugin Capacitor yang Sudah Terpasang

- `@capacitor/core` — inti framework
- `@capacitor/ios` — native iOS bridge

### Plugin opsional yang bisa ditambahkan nanti:
```bash
# Push notifications
npm install @capacitor/push-notifications

# Biometrik (Face ID / Touch ID)  
npm install @capacitor/biometrics

# Share sheet native
npm install @capacitor/share

# Status bar
npm install @capacitor/status-bar
```

---

## Folder Struktur Setelah `npx cap add ios`

```
dutch-ind/
├── ios/                    ← Project Xcode (buat setelah cap add ios)
│   └── App/
│       ├── App.xcworkspace ← Buka ini di Xcode
│       └── App/
│           ├── Assets.xcassets/  ← Taruh ikon di sini
│           └── Info.plist
├── capacitor.config.ts     ← Konfigurasi utama
└── ...
```

---

## Cek Vercel URL Kamu

Buka [vercel.com/dashboard](https://vercel.com/dashboard) → klik project → copy URL deployment.
Biasanya: `https://dutch-indd.vercel.app` atau domain custom kamu.

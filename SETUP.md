# DUTCH.IND — Panduan Setup

## Prasyarat

- Node.js 18+
- PostgreSQL 14+ (atau MySQL 8+)
- npm / yarn / pnpm
- VS Code (direkomendasikan)

---

## 1. Clone & Install

```bash
# Masuk ke folder project
cd dutch-ind

# Install semua dependencies
npm install

# Pasang ekstensi VS Code yang direkomendasikan
# Buka VS Code → Ctrl+Shift+P → "Extensions: Show Recommended Extensions"
```

---

## 2. Setup Database (PostgreSQL)

### Buat database baru:
```sql
CREATE DATABASE dutch_ind_db;
CREATE USER streetwear_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dutch_ind_db TO streetwear_user;
```

### Atau gunakan MySQL:
```sql
CREATE DATABASE dutch_ind_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'streetwear_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON dutch_ind_db.* TO 'streetwear_user'@'localhost';
FLUSH PRIVILEGES;
```
> Jika MySQL: ganti `provider = "postgresql"` → `provider = "mysql"` di `prisma/schema.prisma`

---

## 3. Environment Variables

```bash
# Salin file contoh env
copy .env.example .env.local
```

Isi nilai pada `.env.local`:

```env
# DATABASE — sesuaikan dengan kredensial kamu
DATABASE_URL="postgresql://streetwear_user:your_password@localhost:5432/dutch_ind_db"

# NEXTAUTH — generate secret dengan: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generated-secret-here"

# MIDTRANS — daftar di https://dashboard.midtrans.com
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"

# EMAIL — Gmail App Password
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="STREETWEAR <noreply@dutch.ind>"

# APP
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="DUTCH.IND"
```

---

## 4. Setup Prisma & Database

```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi (buat semua tabel)
npm run db:migrate
# Ketika diminta nama migrasi, ketik: init

# Isi data contoh (seed)
npm run db:seed
```

Akun yang dibuat oleh seeder:
| Role     | Email                   | Password   |
|----------|-------------------------|------------|
| Admin    | admin@dutch.ind     | admin123   |
| Customer | budi@email.com          | user123    |

---

## 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 6. Halaman Utama

| Halaman                  | URL                          |
|--------------------------|------------------------------|
| Landing Page             | `/`                          |
| Semua Produk             | `/products`                  |
| Detail Produk            | `/products/[slug]`           |
| Keranjang                | `/cart`                      |
| Checkout                 | `/checkout`                  |
| Login                    | `/login`                     |
| Register                 | `/register`                  |
| Profil                   | `/profile`                   |
| Riwayat Pesanan          | `/profile/orders`            |
| Wishlist                 | `/wishlist`                  |
| **Admin Dashboard**      | `/admin`                     |
| Admin — Produk           | `/admin/products`            |
| Admin — Pesanan          | `/admin/orders`              |
| Admin — Pengguna         | `/admin/users`               |
| Admin — Analitik         | `/admin/analytics`           |
| Prisma Studio            | `npm run db:studio`          |

---

## 7. API Endpoints

### Auth
| Method | Endpoint             | Deskripsi           |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Daftar akun baru    |
| POST   | `/api/auth/[...]`    | NextAuth handler    |

### Produk
| Method | Endpoint              | Deskripsi                    |
|--------|-----------------------|------------------------------|
| GET    | `/api/products`       | Daftar produk (+ filter)     |
| GET    | `/api/products/[id]`  | Detail produk berdasarkan ID |

### Pesanan
| Method | Endpoint           | Deskripsi                 |
|--------|--------------------|---------------------------|
| POST   | `/api/orders`      | Buat pesanan baru         |
| GET    | `/api/orders`      | Daftar pesanan user login |

### Pembayaran
| Method | Endpoint                  | Deskripsi              |
|--------|---------------------------|------------------------|
| POST   | `/api/payments/webhook`   | Webhook Midtrans       |

### Kupon
| Method | Endpoint                  | Deskripsi              |
|--------|---------------------------|------------------------|
| POST   | `/api/coupons/validate`   | Validasi kode kupon    |

### Admin
| Method | Endpoint                     | Deskripsi               |
|--------|------------------------------|-------------------------|
| GET    | `/api/admin/analytics`       | Data analitik           |
| POST   | `/api/admin/products`        | Tambah produk           |
| PUT    | `/api/admin/products/[id]`   | Update produk           |
| DELETE | `/api/admin/products/[id]`   | Hapus (soft delete)     |
| PATCH  | `/api/admin/orders/[id]`     | Update status pesanan   |
| PATCH  | `/api/admin/users/[id]`      | Update status pengguna  |

---

## 8. Konfigurasi Midtrans

1. Daftar di [https://dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Ambil Server Key dan Client Key dari **Settings → Access Keys**
3. Aktifkan **Snap** di Settings → Snap Preferences
4. Set Webhook URL: `https://yourdomain.com/api/payments/webhook`
5. Untuk testing, gunakan **Sandbox environment**

### Kartu Test Midtrans:
```
Nomor Kartu : 4811 1111 1111 1114
CVV         : 123
Exp         : 01/25
OTP         : 112233
```

---

## 9. Build Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

---

## 10. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard
# atau gunakan: vercel env add
```

Pastikan mengatur semua variabel environment di Vercel Dashboard → Settings → Environment Variables.

---

## 11. Struktur Folder

```
dutch-ind/
├── prisma/
│   ├── schema.prisma          # Skema database lengkap
│   └── seed.ts                # Data awal (8 produk, kupon, user)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Halaman login & register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/            # Halaman toko utama
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── products/          # Daftar & detail produk
│   │   │   ├── cart/              # Halaman keranjang
│   │   │   ├── checkout/          # Halaman checkout
│   │   │   ├── order-success/     # Halaman sukses pesanan
│   │   │   ├── profile/           # Profil & riwayat pesanan
│   │   │   └── wishlist/          # Halaman wishlist
│   │   ├── admin/             # Panel admin (protected)
│   │   │   ├── page.tsx           # Dashboard admin
│   │   │   ├── products/          # CRUD produk
│   │   │   ├── orders/            # Kelola pesanan
│   │   │   ├── users/             # Kelola pengguna
│   │   │   └── analytics/         # Statistik penjualan
│   │   ├── api/               # API Routes
│   │   │   ├── auth/              # NextAuth + register
│   │   │   ├── products/          # API produk publik
│   │   │   ├── orders/            # API pesanan
│   │   │   ├── payments/webhook/  # Midtrans webhook
│   │   │   ├── coupons/validate/  # Validasi kupon
│   │   │   └── admin/             # API admin (protected)
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Tailwind + custom styles
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, ShopLayout
│   │   ├── home/              # Komponen landing page
│   │   ├── product/           # ProductCard, ProductDetail
│   │   ├── cart/              # CartSidebar
│   │   ├── admin/             # Komponen panel admin
│   │   └── ui/                # Skeleton, badge, dll
│   ├── hooks/                 # useProducts, useOrders
│   ├── lib/                   # prisma, auth, utils, email
│   ├── store/                 # Zustand cart + wishlist store
│   ├── types/                 # TypeScript interfaces
│   └── middleware.ts          # Auth middleware
├── public/images/             # Gambar statis
├── .env.example               # Contoh env variables
├── .vscode/                   # Settings & extensions VS Code
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── SETUP.md                   # Panduan ini
```

---

## 12. Kode Kupon (dari Seeder)

| Kode         | Tipe       | Diskon | Min. Belanja | Keterangan            |
|--------------|------------|--------|--------------|-----------------------|
| `WELCOME10`  | Persentase | 10%    | Rp200.000    | Maks. potongan 100rb  |
| `STREET50K`  | Fixed      | Rp50K  | Rp500.000    | Potongan langsung     |
| `FLASHSALE`  | Persentase | 20%    | Rp300.000    | Maks. potongan 150rb  |

---

## Masalah Umum

**`PrismaClientInitializationError`**
→ Pastikan PostgreSQL berjalan dan DATABASE_URL benar

**`NEXTAUTH_SECRET is required`**
→ Tambahkan NEXTAUTH_SECRET di `.env.local`

**Midtrans snap tidak muncul**
→ Pastikan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY diisi dengan client key (bukan server key)

**Email tidak terkirim**
→ Gunakan Gmail App Password, bukan password akun biasa. Aktifkan 2FA dulu.

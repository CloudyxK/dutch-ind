# DUTCH.IND — Cara Menjalankan Website

## LANGKAH 1 — Install Node.js (wajib, 1x saja)

1. Buka browser, pergi ke: **https://nodejs.org**
2. Klik tombol hijau **"LTS"** (bukan Current)
3. Download dan install seperti biasa (Next → Next → Finish)
4. Setelah install, **restart VS Code**

Cek berhasil dengan buka Terminal di VS Code dan ketik:
```
node --version
```
Harus muncul angka seperti `v20.x.x`

---

## LANGKAH 2 — Setup Project (1x saja)

Buka Terminal di VS Code, pastikan sudah di folder project:
```
cd C:\Users\ROG\streetwear-store
```

Lalu jalankan **satu per satu**:

```bash
# Install semua package
npm install

# Setup database
npx prisma generate
npx prisma db push

# Isi data contoh
npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts
```

---

## LANGKAH 3 — Jalankan Website

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## Login Admin
- URL: http://localhost:3000/admin
- Email: `admin@dutch.ind`
- Password: `admin123`

## Login Customer
- Email: `budi@email.com`  
- Password: `user123`

---

## Kalau Ada Error

**Error: Cannot find module**
→ Jalankan lagi: `npm install`

**Error: Database**
→ Jalankan: `npx prisma db push`

**Port 3000 sudah dipakai**
→ Ketik: `npm run dev -- -p 3001`
→ Buka: http://localhost:3001

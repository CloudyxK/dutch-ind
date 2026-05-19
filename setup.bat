@echo off
echo.
echo ================================================
echo   DUTCH.IND - Setup Otomatis
echo ================================================
echo.

:: Cek Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo.
    echo Silakan install Node.js terlebih dahulu:
    echo Buka browser, pergi ke: https://nodejs.org
    echo Download versi LTS lalu install.
    echo Setelah install, jalankan ulang file ini.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js ditemukan:
node --version
echo.

:: Install dependencies
echo [1/4] Menginstall dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install gagal!
    pause
    exit /b 1
)
echo [OK] Dependencies terinstall
echo.

:: Generate Prisma client
echo [2/4] Menyiapkan database client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma generate gagal!
    pause
    exit /b 1
)
echo [OK] Prisma client siap
echo.

:: Push schema ke database
echo [3/4] Membuat tabel database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database push gagal!
    pause
    exit /b 1
)
echo [OK] Tabel database dibuat
echo.

:: Seed data
echo [4/4] Mengisi data contoh...
call npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
if %errorlevel% neq 0 (
    echo [PERINGATAN] Seed mungkin sudah pernah dijalankan, lanjut...
)
echo [OK] Data contoh siap
echo.

echo ================================================
echo   Setup Selesai!
echo ================================================
echo.
echo Akun yang bisa digunakan:
echo   Admin    : admin@dutch.ind   / admin123
echo   Customer : budi@email.com    / user123
echo.
echo Jalankan website:
echo   npm run dev
echo.
echo Lalu buka browser: http://localhost:3000
echo.
pause

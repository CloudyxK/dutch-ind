@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo ================================================
echo   DUTCH.IND - Deploy ke Vercel
echo ================================================
echo.
echo Step 1: Login ke Vercel (akan buka browser)...
npx.cmd vercel login
echo.
echo Step 2: Deploy...
npx.cmd vercel --prod
pause

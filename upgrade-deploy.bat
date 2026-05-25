@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Installing Next.js 15.3.2...
npm.cmd install next@15.3.2 --save 2>&1
echo.
echo Committing...
git add package.json package-lock.json
git commit -m "fix: upgrade Next.js to 15.3.2 to fix security vulnerability"
git push origin main
echo.
echo Deploying to Vercel...
npx.cmd vercel --prod --token vca_5b1ue9Z8CJ4W26gth0bFprcxHYI1BAuC30XR1gjzW7NJ2fQrxZ4LsEIZ --yes 2>&1
pause

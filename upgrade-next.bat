@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Installing Next.js 16...
npm.cmd install next@16.2.6 --save
echo.
echo Committing and pushing...
git add package.json package-lock.json
git commit -m "fix: upgrade to Next.js 16.2.6 (unvulnerable version)"
git push origin main
echo.
echo Deploying to Vercel...
npx.cmd vercel --prod --token vca_5b1ue9Z8CJ4W26gth0bFprcxHYI1BAuC30XR1gjzW7NJ2fQrxZ4LsEIZ --yes 2>&1
pause

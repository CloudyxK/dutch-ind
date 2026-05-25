@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Deploying to Vercel...
npx.cmd vercel --prod --token vca_5b1ue9Z8CJ4W26gth0bFprcxHYI1BAuC30XR1gjzW7NJ2fQrxZ4LsEIZ --yes 2>&1
echo.
echo Done!
pause

@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Pushing schema to Neon PostgreSQL...
node_modules\.bin\prisma.cmd db push
echo.
echo Generating Prisma client...
node_modules\.bin\prisma.cmd generate
echo.
echo Done!
pause

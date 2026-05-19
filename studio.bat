@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Membuka Prisma Studio di http://localhost:5555 ...
start "" "http://localhost:5555"
node_modules\.bin\prisma.cmd studio

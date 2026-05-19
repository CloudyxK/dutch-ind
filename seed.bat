@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d C:\Users\ROG\streetwear-store
echo Seeding database...
node_modules\.bin\ts-node.cmd --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
echo Done!
pause

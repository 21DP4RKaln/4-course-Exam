@echo off
echo Starting Prisma Studio...
cd /d %~dp0
npx prisma studio --schema=./prisma/schema.prisma

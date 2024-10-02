# Steps to initialize the prisma

1. npm install prisma typescript ts-node @types/node --save-dev
2. npx tsc -init
3. npx prisma init
4. ## To Generate Migration:
   npx prisma migrate dev --name init
5. ## To Generate Prisma Client
   npx prisma generate

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany();
  console.log('--- USERS ---');
  users.forEach(u => console.log(u.email, u.role, u.status));
  const txs = await prisma.transaction.findMany({ where: { deletedAt: null } });
  console.log('--- TRANSACTIONS ---', txs.length);
}
run().finally(() => prisma.$disconnect());

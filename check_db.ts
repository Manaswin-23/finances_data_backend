import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const countAll = await prisma.transaction.count();
  const countActive = await prisma.transaction.count({ where: { deletedAt: null } });
  const all = await prisma.transaction.findMany({ where: { deletedAt: null } });
  const users = await prisma.user.findMany();
  console.log('Total transaction count:', countAll);
  console.log('Active transaction count:', countActive);
  console.log('Users:', JSON.stringify(users.map(u => ({ email: u.email, role: u.role })), null, 2));
  console.log('Active Transactions:', JSON.stringify(all, null, 2));
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

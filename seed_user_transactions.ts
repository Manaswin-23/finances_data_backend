import prisma from "./src/utils/prisma";

async function seed() {
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log("No users found to seed transactions for.");
    return;
  }

  let totalTransactionsAdded = 0;

  for (const user of users) {
    // Check if user already has transactions
    const existingCount = await prisma.transaction.count({ where: { userId: user.id } });
    if (existingCount > 0) continue;

    // Create dummy transactions
    await prisma.transaction.createMany({
      data: [
        {
          amount: 5000,
          type: "INCOME",
          category: "Salary",
          description: "Monthly Salary Income",
          userId: user.id,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          amount: 1500,
          type: "INCOME",
          category: "Bonus",
          description: "Project Bonus",
          userId: user.id,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          amount: 200,
          type: "EXPENSE",
          category: "Groceries",
          description: "Weekly Grocery Run",
          userId: user.id,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          amount: 120,
          type: "EXPENSE",
          category: "Utilities",
          description: "Electric Bill",
          userId: user.id,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    totalTransactionsAdded += 4;
  }

  console.log(`Successfully added ${totalTransactionsAdded} dummy transactions safely mapped to users!`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());

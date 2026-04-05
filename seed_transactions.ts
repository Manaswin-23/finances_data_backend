import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" }});
  
  if (!adminUser) {
    console.log("No admin found. Cannot seed transactions.");
    return;
  }

  console.log("Seeding dummy transactions...");
  
  await prisma.transaction.createMany({
    data: [
      {
        amount: 8500.00,
        type: "INCOME",
        category: "Salary",
        description: "Monthly Tech Salary",
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        userId: adminUser.id
      },
      {
        amount: 120.50,
        type: "EXPENSE",
        category: "Groceries",
        description: "Weekly Grocery Run",
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        userId: adminUser.id
      },
      {
        amount: 60.00,
        type: "EXPENSE",
        category: "Entertainment",
        description: "Movie Tickets",
        date: new Date(),
        userId: adminUser.id
      },
      {
        amount: 2500.00,
        type: "EXPENSE",
        category: "Rent",
        description: "Apartment Rent",
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        userId: adminUser.id
      }
    ]
  });

  console.log("Database seeded with sample transactions successfully!");
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorMiddleware";

export const createTransaction = async (data: any, userId?: string) => {
  return prisma.transaction.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getTransactions = async (filters: any, user: any) => {
  const { category, type, startDate, endDate, search, userId, page = "1", limit = "10" } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = { deletedAt: null };
  if (user?.role === "VIEWER") {
    // Viewers strictly see only their own
    where.userId = user.id;
  } else if (userId) {
    // Admin/Analyst can filter by any user
    where.userId = String(userId);
  }

  if (category) where.category = String(category);
  if (type) where.type = String(type);
  if (search) {
    where.OR = [
      { description: { contains: String(search) } },
      { category: { contains: String(search) } }
    ];
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(String(startDate));
    if (endDate) {
      const endOfDay = new Date(String(endDate));
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.date.lte = endOfDay;
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy: { date: "desc" },
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / take),
  };
};

export const getTransactionById = async (id: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, deletedAt: null },
  });

  if (!transaction) {
    throw new AppError("No transaction found with that ID", 404);
  }

  return transaction;
};

export const updateTransaction = async (id: string, data: any) => {
  return prisma.transaction.update({
    where: { id },
    data,
  });
};

export const deleteTransaction = async (id: string) => {
  return prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

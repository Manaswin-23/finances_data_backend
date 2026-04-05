import prisma from "../utils/prisma";

export const getDashboardSummaryData = async (user: any) => {
  const whereScope: any = { deletedAt: null };
  if (user?.role === "VIEWER") {
    // Viewers only see their own dashboard data
    whereScope.userId = user.id;
  }

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", ...whereScope },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", ...whereScope },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeResult._sum?.amount || 0;
  const totalExpenses = expenseResult._sum?.amount || 0;
  const netBalance = totalIncome - totalExpenses;

  const categoryBreakdown = await prisma.transaction.groupBy({
    by: ["category"],
    where: whereScope,
    _sum: { amount: true },
  });

  const recentActivity = await prisma.transaction.findMany({
    where: whereScope,
    take: 5,
    orderBy: { date: "desc" },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const rawTrends = await prisma.transaction.findMany({
    where: { ...whereScope, date: { gte: sevenDaysAgo } },
    orderBy: { date: "asc" },
  });

  const dailyTrendsMap = rawTrends.reduce((acc: any, tx) => {
    const dateKey = tx.date.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = { date: dateKey, amount: 0, INCOME: 0, EXPENSE: 0 };
    acc[dateKey][tx.type] += tx.amount;
    acc[dateKey].amount += tx.type === "INCOME" ? tx.amount : -tx.amount;
    return acc;
  }, {});

  const trends = Object.values(dailyTrendsMap);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const rawMonthly = await prisma.transaction.findMany({
    where: { ...whereScope, date: { gte: sixMonthsAgo } },
    orderBy: { date: "asc" },
  });

  const monthlyMap = rawMonthly.reduce((acc: any, tx) => {
    const d = tx.date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!acc[key]) acc[key] = { month: key, label, INCOME: 0, EXPENSE: 0 };
    acc[key][tx.type] += tx.amount;
    return acc;
  }, {});

  const monthlyTrends = Object.values(monthlyMap);

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    categoryBreakdown,
    recentActivity,
    trends,
    monthlyTrends,
  };
};

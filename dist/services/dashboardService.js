"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummaryData = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getDashboardSummaryData = async () => {
    const [incomeResult, expenseResult] = await Promise.all([
        prisma_1.default.transaction.aggregate({
            where: { type: "INCOME", deletedAt: null },
            _sum: { amount: true },
        }),
        prisma_1.default.transaction.aggregate({
            where: { type: "EXPENSE", deletedAt: null },
            _sum: { amount: true },
        }),
    ]);
    const totalIncome = incomeResult._sum?.amount || 0;
    const totalExpenses = expenseResult._sum?.amount || 0;
    const netBalance = totalIncome - totalExpenses;
    const categoryBreakdown = await prisma_1.default.transaction.groupBy({
        by: ["category"],
        where: { deletedAt: null },
        _sum: { amount: true },
    });
    const recentActivity = await prisma_1.default.transaction.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { date: "desc" },
    });
    // ── Weekly trends: last 7 days ──────────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const rawTrends = await prisma_1.default.transaction.findMany({
        where: { deletedAt: null, date: { gte: sevenDaysAgo } },
        orderBy: { date: "asc" },
    });
    const dailyTrendsMap = rawTrends.reduce((acc, tx) => {
        const dateKey = tx.date.toISOString().split("T")[0];
        if (!acc[dateKey])
            acc[dateKey] = { date: dateKey, amount: 0, INCOME: 0, EXPENSE: 0 };
        acc[dateKey][tx.type] += tx.amount;
        acc[dateKey].amount += tx.type === "INCOME" ? tx.amount : -tx.amount;
        return acc;
    }, {});
    const trends = Object.values(dailyTrendsMap);
    // ── Monthly trends: last 6 months ───────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const rawMonthly = await prisma_1.default.transaction.findMany({
        where: { deletedAt: null, date: { gte: sixMonthsAgo } },
        orderBy: { date: "asc" },
    });
    const monthlyMap = rawMonthly.reduce((acc, tx) => {
        const d = tx.date;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!acc[key])
            acc[key] = { month: key, label, INCOME: 0, EXPENSE: 0 };
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
exports.getDashboardSummaryData = getDashboardSummaryData;

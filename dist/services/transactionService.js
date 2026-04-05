"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.createTransaction = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const createTransaction = async (data, userId) => {
    return prisma_1.default.transaction.create({
        data: {
            ...data,
            userId,
        },
    });
};
exports.createTransaction = createTransaction;
const getTransactions = async (filters) => {
    const { category, type, startDate, endDate, search, page = "1", limit = "10" } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = { deletedAt: null };
    if (category)
        where.category = String(category);
    if (type)
        where.type = String(type);
    if (search) {
        where.OR = [
            { description: { contains: String(search) } },
            { category: { contains: String(search) } }
        ];
    }
    if (startDate || endDate) {
        where.date = {};
        if (startDate)
            where.date.gte = new Date(String(startDate));
        if (endDate) {
            const endOfDay = new Date(String(endDate));
            endOfDay.setUTCHours(23, 59, 59, 999);
            where.date.lte = endOfDay;
        }
    }
    const [transactions, total] = await Promise.all([
        prisma_1.default.transaction.findMany({
            where,
            skip,
            take,
            orderBy: { date: "desc" },
        }),
        prisma_1.default.transaction.count({ where }),
    ]);
    return {
        transactions,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / take),
    };
};
exports.getTransactions = getTransactions;
const getTransactionById = async (id) => {
    const transaction = await prisma_1.default.transaction.findFirst({
        where: { id, deletedAt: null },
    });
    if (!transaction) {
        throw new errorMiddleware_1.AppError("No transaction found with that ID", 404);
    }
    return transaction;
};
exports.getTransactionById = getTransactionById;
const updateTransaction = async (id, data) => {
    return prisma_1.default.transaction.update({
        where: { id },
        data,
    });
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (id) => {
    return prisma_1.default.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
};
exports.deleteTransaction = deleteTransaction;

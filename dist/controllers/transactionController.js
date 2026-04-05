"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransaction = exports.getTransactions = exports.createTransaction = void 0;
const transactionService = __importStar(require("../services/transactionService"));
const zod_1 = require("zod");
const transactionSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    type: zod_1.z.enum(["INCOME", "EXPENSE"]),
    category: zod_1.z.string(),
    date: zod_1.z.string().optional().transform(val => val ? new Date(val) : new Date()),
    description: zod_1.z.string().optional(),
});
const createTransaction = async (req, res, next) => {
    try {
        const validatedData = transactionSchema.parse(req.body);
        const transaction = await transactionService.createTransaction(validatedData, req.user?.id);
        res.status(201).json({
            status: "success",
            data: { transaction },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, res, next) => {
    try {
        const result = await transactionService.getTransactions(req.query);
        res.status(200).json({
            status: "success",
            results: result.transactions.length,
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            data: { transactions: result.transactions },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactions = getTransactions;
const getTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionService.getTransactionById(req.params.id);
        res.status(200).json({
            status: "success",
            data: { transaction },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransaction = getTransaction;
const updateTransaction = async (req, res, next) => {
    try {
        const validatedData = transactionSchema.partial().parse(req.body);
        const transaction = await transactionService.updateTransaction(req.params.id, validatedData);
        res.status(200).json({
            status: "success",
            data: { transaction },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res, next) => {
    try {
        await transactionService.deleteTransaction(req.params.id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTransaction = deleteTransaction;

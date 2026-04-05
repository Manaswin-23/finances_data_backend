import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as transactionService from "../services/transactionService";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string(),
  date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
  description: z.string().optional(),
});

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(validatedData, req.user?.id);

    res.status(201).json({
      status: "success",
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await transactionService.getTransactions(req.query, req.user);

    res.status(200).json({
      status: "success",
      results: result.transactions.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { transactions: result.transactions },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id as string);

    res.status(200).json({
      status: "success",
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = transactionSchema.partial().parse(req.body);
    const transaction = await transactionService.updateTransaction(req.params.id as string, validatedData);

    res.status(200).json({
      status: "success",
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await transactionService.deleteTransaction(req.params.id as string);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

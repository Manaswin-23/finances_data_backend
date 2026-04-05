import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as dashboardService from "../services/dashboardService";

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await dashboardService.getDashboardSummaryData(req.user);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

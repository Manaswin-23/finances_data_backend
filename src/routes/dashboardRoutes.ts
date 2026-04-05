import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes
router.use(protect);

router.get(
  "/summary",
  restrictTo("ADMIN", "ANALYST", "VIEWER"), // All roles can view summaries
  dashboardController.getDashboardSummary
);

export default router;

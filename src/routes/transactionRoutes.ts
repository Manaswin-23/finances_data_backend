import { Router } from "express";
import * as transactionController from "../controllers/transactionController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes
router.use(protect);

router.post(
  "/",
  // All authenticated users can log their own transactions now
  transactionController.createTransaction
);

router.get(
  "/",
  restrictTo("ADMIN", "ANALYST", "VIEWER"), // All roles can view records
  transactionController.getTransactions
);

router.get(
  "/:id",
  restrictTo("ADMIN", "ANALYST", "VIEWER"),
  transactionController.getTransaction
);

router.patch(
  "/:id",
  restrictTo("ADMIN"), // Only Admin can update
  transactionController.updateTransaction
);

router.delete(
  "/:id",
  restrictTo("ADMIN"), // Only Admin can delete
  transactionController.deleteTransaction
);

export default router;

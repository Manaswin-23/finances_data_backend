import { Router } from "express";
import * as userController from "../controllers/userController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = Router();

// Only Admin can access these routes
router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser); // Admin can create users
router.patch("/:id/role", userController.updateUserRole);
router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

export default router;

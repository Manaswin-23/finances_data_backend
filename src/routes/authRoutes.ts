import { Router } from "express";
import * as authController from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authLimiter, authController.login);

export default router;

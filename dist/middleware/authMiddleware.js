"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorMiddleware_1 = require("./errorMiddleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new errorMiddleware_1.AppError("You are not logged in!", 401));
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return next(new errorMiddleware_1.AppError("The user belonging to this token no longer exists.", 401));
        }
        if (user.status === "INACTIVE") {
            return next(new errorMiddleware_1.AppError("Your account is inactive.", 403));
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        next();
    }
    catch (error) {
        next(new errorMiddleware_1.AppError("Invalid token. Please log in again!", 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorMiddleware_1.AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;

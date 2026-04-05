"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";
const signToken = (id, role, email, name) => {
    return jsonwebtoken_1.default.sign({ id, role, email, name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
const registerUser = async (data) => {
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new errorMiddleware_1.AppError("User already exists", 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const user = await prisma_1.default.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: "VIEWER",
        },
    });
    const token = signToken(user.id, user.role, user.email, user.name);
    return { user, token };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    if (!email || !password) {
        throw new errorMiddleware_1.AppError("Please provide email and password", 400);
    }
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        throw new errorMiddleware_1.AppError("Incorrect email or password", 401);
    }
    if (user.status === "INACTIVE") {
        throw new errorMiddleware_1.AppError("Your account is inactive", 403);
    }
    const token = signToken(user.id, user.role, user.email, user.name);
    return { user, token };
};
exports.loginUser = loginUser;

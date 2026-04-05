"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserStatus = exports.updateUserRole = exports.createUser = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const getAllUsers = async () => {
    return prisma_1.default.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
};
exports.getAllUsers = getAllUsers;
const createUser = async (data) => {
    const { email, password, name, role = "VIEWER" } = data;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new errorMiddleware_1.AppError("Email already in use", 400);
    const hashedPassword = await bcryptjs_1.default.hash(password || "Password123!", 12);
    return prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
            status: "ACTIVE",
        },
        select: { id: true, email: true, name: true, role: true, status: true }
    });
};
exports.createUser = createUser;
const updateUserRole = async (id, role) => {
    if (!["ADMIN", "ANALYST", "VIEWER"].includes(role)) {
        throw new errorMiddleware_1.AppError("Invalid role", 400);
    }
    return prisma_1.default.user.update({
        where: { id },
        data: { role },
    });
};
exports.updateUserRole = updateUserRole;
const updateUserStatus = async (id, status) => {
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
        throw new errorMiddleware_1.AppError("Invalid status", 400);
    }
    return prisma_1.default.user.update({
        where: { id },
        data: { status },
    });
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (id) => {
    return prisma_1.default.user.delete({
        where: { id },
    });
};
exports.deleteUser = deleteUser;

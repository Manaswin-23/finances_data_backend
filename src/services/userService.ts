import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorMiddleware";

export const getAllUsers = async () => {
  return prisma.user.findMany({
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

export const createUser = async (data: any) => {
  const { email, password, name, role = "VIEWER" } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("Email already in use", 400);

  const hashedPassword = await bcrypt.hash(password || "Password123!", 12);

  return prisma.user.create({
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

export const updateUserRole = async (id: string, role: any) => {
  if (!["ADMIN", "ANALYST", "VIEWER"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  return prisma.user.update({
    where: { id },
    data: { role },
  });
};

export const updateUserStatus = async (id: string, status: any) => {
  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

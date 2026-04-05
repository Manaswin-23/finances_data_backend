import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { AppError } from "../middleware/errorMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

const signToken = (id: string, role: string, email: string, name: string | null, status: string) => {
  return jwt.sign({ id, role, email, name, status }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: "VIEWER",
    },
  });

  const token = signToken(user.id, user.role, user.email, user.name, user.status);
  return { user, token };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  if (user.status === "INACTIVE") {
    throw new AppError("Your account is inactive", 403);
  }

  const token = signToken(user.id, user.role, user.email, user.name, user.status);
  return { user, token };
};

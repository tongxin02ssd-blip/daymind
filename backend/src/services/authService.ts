import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/auth";

const SALT_ROUNDS = 10;

function publicUser(user: { id: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function register(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || password.length < 6) {
    const error = new Error("Email is required and password must be at least 6 characters");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) {
    const error = new Error("Email already registered");
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      context: { create: { content: "", isExpanded: true } }
    }
  });

  return { token: signToken(user.id), user: publicUser(user) };
}

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    const error = new Error("Invalid email or password");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const error = new Error("Invalid email or password");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  return { token: signToken(user.id), user: publicUser(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("User not found");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }
  return publicUser(user);
}

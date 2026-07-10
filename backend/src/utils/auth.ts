import jwt from "jsonwebtoken";

const TOKEN_EXPIRES_IN = "7d";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as { userId: string };
}

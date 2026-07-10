import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

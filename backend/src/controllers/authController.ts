import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as authService from "../services/authService";

export const register = asyncHandler(async (req, res: Response) => {
  const result = await authService.register(req.body.email || "", req.body.password || "");
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res: Response) => {
  const result = await authService.login(req.body.email || "", req.body.password || "");
  res.json(result);
});

export const me = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const user = await authService.getMe(req.userId!);
  res.json({ user });
});

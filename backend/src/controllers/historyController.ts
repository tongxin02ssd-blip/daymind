import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as historyService from "../services/historyService";

export const getHistory = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const start = String(req.query.start || "");
  const end = String(req.query.end || "");
  const history = await historyService.getHistory(req.userId!, start, end);
  res.json({ history });
});

export const getHistorySummary = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const start = String(req.query.start || "");
  const end = String(req.query.end || "");
  const days = await historyService.getHistorySummary(req.userId!, start, end);
  res.json({ days });
});

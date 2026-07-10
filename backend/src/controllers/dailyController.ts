import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as dailyService from "../services/dailyService";

export const getDaily = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const daily = await dailyService.getDailyEntry(req.userId!, req.params.date);
  res.json({ daily });
});

export const updateRecord = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const daily = await dailyService.updateRecord(req.userId!, req.params.date, req.body.record || "");
  res.json({ daily });
});

import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getEntryForReport } from "../services/dailyService";
import { generateAndSaveReport } from "../services/aiService";

export const generateReport = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const entry = await getEntryForReport(req.userId!, req.params.date);
  const report = await generateAndSaveReport(req.userId!, entry);
  return res.json({ report });
});

import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as planService from "../services/planService";

export const createPlan = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const daily = await planService.createPlan(req.userId!, req.params.date, req.body.content || "");
  res.status(201).json({ daily });
});

export const updatePlan = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const daily = await planService.updatePlan(req.userId!, req.params.planId, {
    content: req.body.content,
    note: req.body.note,
    completed: req.body.completed,
    sortOrder: req.body.sortOrder
  });
  res.json({ daily });
});

export const deletePlan = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const daily = await planService.deletePlan(req.userId!, req.params.planId);
  res.json({ daily });
});

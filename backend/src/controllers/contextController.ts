import { Response } from "express";
import { asyncHandler } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as contextService from "../services/contextService";

export const getContext = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const context = await contextService.getContext(req.userId!);
  res.json({ context });
});

export const updateContext = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const context = await contextService.updateContext(req.userId!, {
    content: req.body.content,
    isExpanded: req.body.isExpanded
  });
  res.json({ context });
});

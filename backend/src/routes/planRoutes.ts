import { Router } from "express";
import * as planController from "../controllers/planController";

export const planRoutes = Router();

planRoutes.put("/:planId", planController.updatePlan);
planRoutes.delete("/:planId", planController.deletePlan);

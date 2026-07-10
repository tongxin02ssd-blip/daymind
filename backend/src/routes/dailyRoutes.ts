import { Router } from "express";
import * as dailyController from "../controllers/dailyController";
import * as planController from "../controllers/planController";
import * as reportController from "../controllers/reportController";

export const dailyRoutes = Router();

dailyRoutes.get("/:date", dailyController.getDaily);
dailyRoutes.put("/:date/record", dailyController.updateRecord);
dailyRoutes.post("/:date/plans", planController.createPlan);
dailyRoutes.post("/:date/report/generate", reportController.generateReport);

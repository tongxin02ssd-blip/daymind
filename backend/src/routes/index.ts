import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authRoutes } from "./authRoutes";
import { contextRoutes } from "./contextRoutes";
import { dailyRoutes } from "./dailyRoutes";
import { planRoutes } from "./planRoutes";
import { historyRoutes } from "./historyRoutes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/context", authMiddleware, contextRoutes);
routes.use("/daily", authMiddleware, dailyRoutes);
routes.use("/plans", authMiddleware, planRoutes);
routes.use("/history", authMiddleware, historyRoutes);

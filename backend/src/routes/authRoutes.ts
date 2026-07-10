import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as authController from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, authController.me);

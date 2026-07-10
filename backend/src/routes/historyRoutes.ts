import { Router } from "express";
import * as historyController from "../controllers/historyController";

export const historyRoutes = Router();

historyRoutes.get("/", historyController.getHistory);

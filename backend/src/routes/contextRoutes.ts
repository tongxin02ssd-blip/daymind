import { Router } from "express";
import * as contextController from "../controllers/contextController";

export const contextRoutes = Router();

contextRoutes.get("/", contextController.getContext);
contextRoutes.put("/", contextController.updateContext);

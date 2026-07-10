import cors from "cors";
import express from "express";
import { routes } from "./routes";
import { errorMiddleware } from "./middlewares/errorMiddleware";

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);
app.use(errorMiddleware);

import { NextFunction, Request, Response } from "express";

export function asyncHandler<T extends Request>(
  handler: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorMiddleware(
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? error.message || "Internal Server Error" : error.message
  });
}

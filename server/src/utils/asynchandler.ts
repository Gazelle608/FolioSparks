import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler so thrown errors go to next() instead
 * of crashing the process. Saves a try/catch on every controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

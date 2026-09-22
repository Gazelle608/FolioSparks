import type { NextFunction, Request, Response } from "express";

import { z, type ZodTypeAny } from "zod";

// ============================================================
// Types
// ============================================================
interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

// ============================================================
// validate — parse body/query/params against Zod schemas
// Replaces req.body, req.query, req.params with the parsed version
// (so downstream code gets types + defaults applied)
// ============================================================
export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        // Express 5 makes req.query a getter; assign carefully
        Object.defineProperty(req, "query", {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      return next();
    }
    catch (error) {
      // ZodError goes to errorHandler, which formats field errors
      return next(error);
    }
  };
}

// ============================================================
// validateOrPass — like validate, but never fails
// Use for query params where defaults are fine (e.g. pagination)
// ============================================================
export function validateOrPass(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (result.success)
        req.body = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) {
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (result.success) {
        req.params = result.data as typeof req.params;
      }
    }
    return next();
  };
}

// ============================================================
// Common schemas — reuse across routes
// ============================================================
export const commonSchemas = {
  idParam: z.object({
    id: z.string().uuid("Invalid id"),
  }),

  storyIdParam: z.object({
    storyId: z.string().uuid("Invalid story id"),
  }),

  chapterNumParam: z.object({
    num: z.coerce.number().int().positive(),
  }),

  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(24),
    offset: z.coerce.number().int().min(0).default(0),
  }),
};

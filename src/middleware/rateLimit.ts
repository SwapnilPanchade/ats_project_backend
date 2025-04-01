import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const cvUploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }
    return req.ip || "unknown-client";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Maximum 5 CV uploads per day allowed",
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});

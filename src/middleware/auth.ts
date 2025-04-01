import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        org_id?: number;
      };
    }
  }
}

interface UserRow extends RowDataPacket {
  id: number;
  role: string;
  org_id?: number;
}

export const authenticate = (allowedRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication token required" });
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable not configured");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        role: string;
      };

      const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
        "SELECT id, role, org_id FROM users WHERE id = ?",
        [decoded.id]
      );

      const user = rows[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
          requiredRoles: allowedRoles,
        });
      }

      req.user = {
        id: user.id,
        role: user.role,
        org_id: user.org_id,
      };

      next();
    } catch (err) {
      const error = err as Error;

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }

      console.error("Authentication error:", error);
      res.status(500).json({
        error: "Authentication failed",
        message: error.message,
      });
    }
  };
};

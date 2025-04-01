import express, { Request, Response, NextFunction, Router } from "express";
import { authenticate } from "../middleware/auth";
import { CV } from "../types/cv";
import { pool } from "../config/db";

const router: Router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  return authenticate(["recruiter"])(req, res, next);
});

router.get("/cvs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.org_id) {
      return res.status(403).json({ error: "Organization access required" });
    }

    const [rows] = await pool.query<(CV & import("mysql2").RowDataPacket)[]>(
      "SELECT id, candidate_id, file_path, uploaded_at FROM cvs WHERE org_id = ?",
      [req.user.org_id]
    );

    const response = rows.map((row) => ({
      id: row.id,
      candidateId: row.candidate_id,
      filePath: row.file_path,
      uploadedAt: row.uploaded_at.toISOString(),
    }));

    return res.json({
      success: true,
      cvs: response,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

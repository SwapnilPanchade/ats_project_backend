import { Request, Response } from "express";
import { analyzeCV } from "../utils/gemini";
import { pool } from "../config/db";
import { z } from "zod";

const analysisRequestSchema = z.object({
  params: z.object({
    cvId: z.string().regex(/^\d+$/, "CV ID must be numeric"),
  }),
});

export const requestAnalysis = async (req: Request, res: Response) => {
  try {
    const { params } = analysisRequestSchema.parse(req);
    const cvId = parseInt(params.cvId);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [cvResult] = await pool.query(
      "SELECT * FROM cvs WHERE id = ? AND org_id = ?",
      [cvId, req.user.org_id]
    );

    const cv = (cvResult as any)[0];
    if (!cv) {
      return res.status(404).json({ error: "CV not found or access denied" });
    }

    const analysis = await analyzeCV(cv.file_path);

    res.json({
      success: true,
      message: "Analysis initiated",
      analysisId: Date.now(),
      wsEndpoint: `/ws/analysis/${Date.now()}`,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({
      error: "Analysis failed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

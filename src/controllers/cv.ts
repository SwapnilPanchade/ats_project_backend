import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { CVModel } from "../models/cv";

declare module "express" {
  interface Request {
    user?: {
      id: number;
      role: string;
      org_id?: number;
    };
  }
}

const storage = multer.diskStorage({
  destination: "uploads/cvs",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadCV = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const orgId = parseInt(req.body.orgId);
    if (isNaN(orgId))
      return res.status(400).json({ error: "Invalid organization ID" });

    const cvId = await CVModel.create(req.user.id, orgId, req.file.path);

    res.status(201).json({
      success: true,
      cvId,
      filePath: req.file.path,
    });
  } catch (err) {
    console.error("CV upload error:", err);
    res.status(500).json({
      error: "CV upload failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

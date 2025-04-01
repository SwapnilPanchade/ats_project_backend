import express from "express";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import { upload, uploadCV } from "../controllers/cv";

const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  authenticate(["candidate"])(req, res, next);
});

router.post(
  "/",
  upload.single("cv"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await uploadCV(req, res);
      next();
    } catch (error) {
      next(error);
    }
  }
);

export default router;

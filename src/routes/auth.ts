import express from "express";
import { register } from "../controllers/auth";
import { validate } from "../middleware/validation";
import { registerSchema } from "../schemas/auth";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

export default router;

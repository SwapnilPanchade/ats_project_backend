import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      name,
      email,
      password_hash: passwordHash,
      role,
      org_id: null,
    });

    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(201).json({ userId, token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

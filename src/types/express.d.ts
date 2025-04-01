import { Request } from "express";

declare module "express" {
  interface Request {
    user?: {
      id: number;
      role: string;
      org_id?: number;
    };
    ip?: string;
  }
}

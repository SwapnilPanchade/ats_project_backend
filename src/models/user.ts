import { pool } from "../config/db";
interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "organization" | "recruiter" | "candidate";
  org_id: number | null;
}

export const UserModel = {
  async create(user: Omit<User, "id">): Promise<number> {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role, org_id) VALUES (?, ?, ?, ?, ?)",
      [user.name, user.email, user.password_hash, user.role, user.org_id]
    );
    return (result as any).insertId;
  },

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return (rows as User[])[0] || null;
  },
};

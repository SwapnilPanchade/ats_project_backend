import { pool, CV, ResultSetHeader } from "../config/db";

export const CVModel = {
  async create(
    candidateId: number,
    orgId: number,
    filePath: string
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO cvs (candidate_id, org_id, file_path) VALUES (?, ?, ?)",
      [candidateId, orgId, filePath]
    );
    return result.insertId;
  },

  async findByOrg(orgId: number): Promise<CV[]> {
    const [rows] = await pool.query<CV[]>(
      "SELECT * FROM cvs WHERE org_id = ?",
      [orgId]
    );
    return rows;
  },
};

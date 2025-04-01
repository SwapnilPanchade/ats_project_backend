import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface CV extends RowDataPacket {
  id: number;
  candidate_id: number;
  org_id: number;
  file_path: string;
  uploaded_at: Date;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export { pool, CV, ResultSetHeader };

import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { analyzeCV } from "./gemini";

export const setupWebSocket = (server: any) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { token, cvId } = data;

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: number;
          role: string;
        };
        if (decoded.role !== "recruiter") throw new Error("Unauthorized");

        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
          decoded.id,
        ]);
        const recruiter = (rows as any)[0];
        if (!recruiter) throw new Error("Recruiter not found");

        const [cvRows] = await pool.query("SELECT * FROM cvs WHERE id = ?", [
          cvId,
        ]);
        const cv = (cvRows as any)[0];
        if (!cv || cv.org_id !== recruiter.org_id)
          throw new Error("CV not found");

        const analysisStream = await analyzeCV(cv.file_path);
        for await (const chunk of analysisStream.stream) {
          ws.send(JSON.stringify({ chunk: chunk.text() }));
        }
        ws.send(JSON.stringify({ status: "completed" }));
      } catch (err) {
        ws.send(JSON.stringify({ error: (err as Error).message }));
        ws.close();
      }
    });
  });
};

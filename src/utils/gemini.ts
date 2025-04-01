import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeCV = async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    return model.generateContentStream(`Analyze this CV: ${content}`);
  } catch (err) {
    throw new Error("Error processing CV");
  }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-1.5";

if (!apiKey) {
  console.warn("[AI FormForge] GEMINI_API_KEY is not set. AI generation will be unavailable.");
}

if (!process.env.GEMINI_MODEL) {
  console.info("[AI FormForge] Using default Gemini model: gemini-1.5. Set GEMINI_MODEL to override.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: modelName });
export const geminiModelName = modelName;

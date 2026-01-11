// src/services/aiService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export const generateAIResponse = async (history: { role: string; content: string }[], userMessage: string) => {
  try {
    // 1. Construct the Context (The "Prompt Engineering")
    const prompt = `
      You are a helpful Customer Support AI for a company called "ResolvAI".
      Be polite, concise, and professional.
      If you cannot solve the issue, ask them to wait for a human agent.
      
      Conversation History:
      ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      User: ${userMessage}
      AI:
    `;

    // 2. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am currently experiencing high traffic. Please wait for a human agent.";
  }
};
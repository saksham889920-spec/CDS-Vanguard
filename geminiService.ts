
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType } from "./types.ts";
import { FALLBACK_QUESTIONS, getGenericFallback } from "./fallbackData.ts";

export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `UPSC CDS Exam Strategist. Rapidly generate 10 MCQs for ${section}: ${topicName}. 
  Difficulty: High (Analytical). 
  Style: Concise, Military-grade.
  Include: Question, 4 options, Correct Index, Short Explanation, and a 'intelBrief' (corePrinciple, upscContext, strategicApproach, recallHacks).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 10 MCQs on ${topicName} for CDS. Use JSON format. Be extremely concise to minimize latency.`,
      config: {
        systemInstruction,
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 }, // DISABLE THINKING FOR <10s LATENCY
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              intelBrief: {
                type: Type.OBJECT,
                properties: {
                  corePrinciple: { type: Type.STRING },
                  upscContext: { type: Type.STRING },
                  strategicApproach: { type: Type.STRING },
                  recallHacks: { type: Type.STRING }
                },
                required: ["corePrinciple", "upscContext", "strategicApproach", "recallHacks"]
              }
            },
            required: ["id", "text", "options", "correctAnswer", "explanation", "intelBrief"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    if (!text) throw new Error("Empty Response");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Gemini Speed Failure:", error);
    return getGenericFallback(topicName);
  }
};

export const getDetailedConceptBrief = async () => ({
  corePrinciple: "Focus on fundamentals.",
  upscContext: "High priority.",
  strategicApproach: "1. Read. 2. Eliminate. 3. Select.",
  recallHacks: "Use acronyms."
});

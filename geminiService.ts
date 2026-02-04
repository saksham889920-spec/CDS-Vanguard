
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { FALLBACK_QUESTIONS, getGenericFallback } from "./fallbackData.ts";

export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  // Minimalist system instruction for maximum generation speed
  const systemInstruction = `UPSC CDS Strategist. Rapidly generate 10 MCQs for ${section}: ${topicName}. 
  Strictly 4 options per question. Focus on analytical difficulty. Return ONLY a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 10 MCQs on ${topicName} for UPSC CDS. No briefs, just question, options, answer, and explanation.`,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // NO THINKING = ULTRA FAST
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
              explanation: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    if (!text) throw new Error("Empty Response");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("MCQ Generation Failed:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * Generates a detailed Intel Brief for a SINGLE question on demand.
 * This happens instantly when the user clicks 'Expand'.
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `Generate a tactical UPSC Intel Brief for this question: "${questionText}" in the topic "${topicName}".`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a UPSC Strategist. Create a concise Intel Brief with core principle, UPSC context, strategic approach, and a recall hack.",
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          corePrinciple: { type: Type.STRING },
          upscContext: { type: Type.STRING },
          strategicApproach: { type: Type.STRING },
          recallHacks: { type: Type.STRING }
        },
        required: ["corePrinciple", "upscContext", "strategicApproach", "recallHacks"]
      }
    }
  });

  const text = (response.text || "").replace(/```json|```/g, "").trim();
  return JSON.parse(text) as ConceptBrief;
};

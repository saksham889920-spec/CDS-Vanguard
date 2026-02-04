
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

/**
 * PHASE 1: ULTRA-FAST START
 * Generates only text and options to get the user into the test immediately.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `UPSC CDS Strategist. Rapidly generate 10 MCQs for ${topicName}. Return ONLY a JSON array of objects with 'id', 'text', and 'options' (array of 4). Minimize words to maximize speed. Difficulty: High.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 10 ${topicName} MCQs for CDS. JSON format.`,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "text", "options"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    if (!text) throw new Error("Empty Response");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("MCQ Sprint Failed:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 2: SILENT DISPATCH
 * Fetches answers and explanations for the specific questions generated in Phase 1.
 */
export const fetchSolutionKey = async (questions: Question[]): Promise<Record<string, { correctAnswer: number; explanation: string }>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `For these 10 UPSC questions, provide the correct answer index (0-3) and a professional UPSC-style explanation.
  Questions: ${JSON.stringify(questions.map(q => ({ id: q.id, text: q.text })))}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are the UPSC Chief Examiner. Provide precise answer indices and high-quality educational explanations. Return JSON.",
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    const data = JSON.parse(text) as Array<{ id: string; correctAnswer: number; explanation: string }>;
    
    const keyMap: Record<string, { correctAnswer: number; explanation: string }> = {};
    data.forEach(item => {
      keyMap[item.id] = { correctAnswer: item.correctAnswer, explanation: item.explanation };
    });
    return keyMap;
  } catch (error) {
    console.error("Solution Key Background Fetch Failed:", error);
    return {};
  }
};

/**
 * PHASE 3: HIGH-QUALITY ON-DEMAND INTEL
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: `Detailed UPSC Analysis for: "${questionText}" in "${topicName}".`,
    config: {
      systemInstruction: "Expert UPSC Strategist. Return JSON: corePrinciple, upscContext, strategicApproach, recallHacks.",
      temperature: 0.5,
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

  return JSON.parse(response.text.trim()) as ConceptBrief;
};

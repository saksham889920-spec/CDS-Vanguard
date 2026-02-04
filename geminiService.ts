
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
  
  const systemInstruction = `
    You are an expert UPSC (CDS) Exam Content Strategist. 
    Generate exactly 10 high-quality, conceptual MCQs and their corresponding detailed Intel Briefs.
    
    STRICT RULES:
    1. MATCH CDS DIFFICULTY: Questions must be analytical and application-based.
    2. SUBJECT CONTEXT: For ${section}, focus on ${subjectName} core concepts.
    3. TOPIC: Strictly about ${topicName}.
    4. BUNDLED INTEL: Each question MUST include an 'intelBrief' object containing:
       - corePrinciple: The fundamental logic/concept.
       - upscContext: Why this matters in the current CDS trend.
       - strategicApproach: 3-step battle plan to solve such questions.
       - recallHacks: A memory trick or shorthand.
  `;

  const prompt = `Generate exactly 10 unique MCQs and Intel Briefs for CDS: ${section} -> ${subjectName} -> ${topicName}. Return a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6, // Optimized for speed and deterministic output
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
                  strategicApproach: { type: Type.ARRAY, items: { type: Type.STRING } },
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

    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    if (!text) throw new Error("Empty AI response");
    
    const parsed = JSON.parse(text) as Question[];
    return parsed.slice(0, 10);
  } catch (error) {
    console.error("Gemini API Error:", error);
    const specific = FALLBACK_QUESTIONS[topicId];
    if (specific && specific.length >= 10) return specific.slice(0, 10);
    return getGenericFallback(topicName);
  }
};

// This is now legacy/unused as data is pre-fetched, but kept for interface safety
export const getDetailedConceptBrief = async (question: string, topic: string): Promise<ConceptBrief> => {
  return {
    corePrinciple: "The primary concept involves standard UPSC analytical frameworks.",
    upscContext: "Frequent in CDS Paper 2.",
    strategicApproach: ["Analyze basics.", "Eliminate options.", "Select best fit."],
    recallHacks: "UPSC focuses on precision here."
  };
};

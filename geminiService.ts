
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

/**
 * PHASE 1: AUTHORITATIVE SPRINT
 * Generates Question, Options, AND Correct Answer.
 * This guarantees the scoring logic is fixed and accurate from the start.
 * Speed: Very Fast (No explanations/briefs generated here).
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `UPSC CDS Exam Generator. 
  Task: Create 10 high-quality MCQs for '${topicName}'. 
  Output: JSON Array only. 
  Fields: id, text, options (4 items), correctAnswer (0-3 index).
  Constraint: Ensure one option is indisputably correct.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 10 MCQs for ${topicName}. JSON format.`,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // Zero thinking for maximum speed
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER }
            },
            required: ["id", "text", "options", "correctAnswer"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    if (!text) throw new Error("Empty Response");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Phase 1 Generation Failed:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 2: DEEP ENRICHMENT (Background)
 * Generates Explanations AND Intel Briefs for the already-created questions.
 * This runs while the user is taking the test.
 */
export const fetchEnrichmentData = async (questions: Question[], topicName: string): Promise<Record<string, { explanation: string; intelBrief: ConceptBrief }>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  // We send the questions AND the correct answer to the model so it can explain WHY it is correct.
  const inputPayload = questions.map(q => ({
    id: q.id,
    question: q.text,
    correctOption: q.options[q.correctAnswer],
    allOptions: q.options
  }));

  const prompt = `For these 10 UPSC CDS questions, provide:
  1. A detailed Explanation.
  2. A Strategic Intel Brief (Core Principle, Context, Tactics, Recall Hacks).
  Input Data: ${JSON.stringify(inputPayload)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a UPSC Senior Strategist. Provide deep analytical explanations and strategic briefs. Return a JSON Map keyed by Question ID.",
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          additionalProperties: {
            type: Type.OBJECT,
            properties: {
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
            required: ["explanation", "intelBrief"]
          }
        }
      }
    });

    const text = (response.text || "").replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Phase 2 Enrichment Failed:", error);
    return {};
  }
};

/**
 * FALLBACK: Individual Brief Fetch (Only used if Phase 2 fails)
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

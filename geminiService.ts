
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

// Using the fastest stable model available
const FAST_MODEL = "gemini-flash-latest";

/**
 * PHASE 1: AUTHORITATIVE SPRINT
 * Generates Question, Options, AND Correct Answer.
 * Optimized for sub-5-second latency.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extremely concise system instruction to prevent model rambling
  const systemInstruction = `UPSC CDS Exam Generator. Topic: ${topicName}. 
  Output: JSON Array (10 items). 
  Schema: id (string), text (string), options (string[]), correctAnswer (0-3 int).
  Constraint: No markdown, no conversational filler.`;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate 10 hard MCQs for ${topicName}.`,
      config: {
        systemInstruction,
        temperature: 0.5,
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
 * PHASE 2: BACKGROUND EXPLANATIONS (Lightweight)
 * We ONLY fetch explanations here. We do NOT fetch Intel Briefs.
 * This ensures this request finishes before the user completes the first few questions.
 */
export const fetchEnrichmentData = async (questions: Question[], topicName: string): Promise<Record<string, string>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Minimal payload to Context
  const inputPayload = questions.map(q => ({
    id: q.id,
    q: q.text,
    a: q.options[q.correctAnswer]
  }));

  const prompt = `Provide a 2-sentence UPSC explanation for each question.
  Input: ${JSON.stringify(inputPayload)}`;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Return a JSON Object where Key=QuestionID and Value=ExplanationString.",
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          additionalProperties: {
            type: Type.STRING
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
 * PHASE 3: ON-DEMAND INTEL (Click-to-Load)
 * High detailed strategy, fetched only when requested.
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Strategic Brief for: "${questionText}" (${topicName})`,
    config: {
      systemInstruction: "UPSC Strategist. JSON: corePrinciple, upscContext, strategicApproach, recallHacks.",
      temperature: 0.5,
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

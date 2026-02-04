
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

/**
 * GENERATE QUESTIONS: Now uses parallel batching for extreme speed.
 * Fires two concurrent requests for 5 questions each.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using Flash Lite (2.5) for the absolute fastest response time
  const model = "gemini-flash-lite-latest";
  
  const systemInstruction = `UPSC CDS Exam Data Engine. Task: Generate exactly 5 MCQs for ${section} - ${topicName}. Difficulty: Analytical. Format: JSON array.`;

  const fetchBatch = async (batchId: number): Promise<Question[]> => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Generate 5 unique MCQs on ${topicName} for UPSC CDS. Batch ID: ${batchId}. Include: text, options (4), correctAnswer (0-3), and explanation.`,
        config: {
          systemInstruction,
          temperature: 0.6,
          // Thinking is not needed for pure MCQ data extraction, maximizing speed
          thinkingConfig: { thinkingBudget: 0 },
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
      if (!text) return [];
      const parsed = JSON.parse(text) as Question[];
      // Ensure IDs are unique across batches
      return parsed.map((q, idx) => ({ ...q, id: `q-${batchId}-${idx}-${Date.now()}` }));
    } catch (error) {
      console.error(`Batch ${batchId} failure:`, error);
      return [];
    }
  };

  try {
    // FIRE TWO REQUESTS IN PARALLEL (5 + 5 = 10 questions)
    // This effectively halves the latency of the generation process
    const [batch1, batch2] = await Promise.all([
      fetchBatch(1),
      fetchBatch(2)
    ]);

    const combined = [...batch1, ...batch2];
    
    // Fallback if the API returned partial results
    if (combined.length < 5) {
      throw new Error("Insufficient questions generated");
    }

    return combined;
  } catch (error) {
    console.error("Parallel Generation Failure:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * GET DETAILED CONCEPT BRIEF: On-demand retrieval for a specific question.
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-flash-lite-latest"; // Also using lite for on-demand info

  const prompt = `Tactical UPSC Brief for: "${questionText}" in "${topicName}".`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a UPSC Strategist. Return a JSON Intel Brief with: corePrinciple, upscContext, strategicApproach (concise tactics), and recallHacks (short mnemonic).",
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

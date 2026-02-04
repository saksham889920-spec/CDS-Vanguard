
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

const FAST_MODEL = "gemini-2.5-flash";

/**
 * KEY ROTATION LOGIC
 * Supports multiple API keys separated by commas.
 * The vite.config.ts now aggregates AIzaSy_Key1...5 into process.env.API_KEY
 */
const API_KEYS = (process.env.API_KEY || "")
  .split(",")
  .map(k => k.trim())
  .filter(k => k.length > 0);

let keyIndex = 0;

// Log key status for debugging
if (API_KEYS.length > 0) {
  console.log(`[System] Intel Uplink Established: ${API_KEYS.length} Active Key(s) Detected.`);
} else {
  console.warn("[System] No API Keys detected. Offline Vault will be used.");
}

const getNextApiKey = (): string => {
  if (API_KEYS.length === 0) return "";
  const key = API_KEYS[keyIndex];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return key;
};

// Helper for delay to prevent hitting rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HELPER: Determines the specific formatting rule based on topic.
 */
const getFormatInstruction = (topicName: string): string => {
  const lower = topicName.toLowerCase();
  
  if (lower.includes('reading comprehension')) {
    return "Include a short passage (4-6 sentences) followed by the question based on it.";
  }
  if (lower.includes('ordering')) {
    return "The question MUST consist of jumbled parts labeled P, Q, R, S. The options MUST be sequences like 'PQRS', 'QRSP'. Do not solve it in the question text.";
  }
  if (lower.includes('parts of speech')) {
    return "The question MUST contain a sentence with ONE specific word highlighted (e.g., in CAPS or quotes). Ask for the Part of Speech (Noun, Adverb, Preposition, etc.) of that word.";
  }
  if (lower.includes('cloze') || lower.includes('fill in') || lower.includes('prepositions')) {
    return "The question text MUST contain a sentence or short paragraph with a blank represented by '_______'. Options must be words/phrases to fill that blank.";
  }
  if (lower.includes('trigonometry') || lower.includes('geometry') || lower.includes('mensuration')) {
    return "Questions should involve calculation or conceptual application. Use standard math notation.";
  }
  return "No markdown. Concise text.";
}

/**
 * HELPER: Generates a batch of questions.
 * @param attempt - Internal counter for retries
 */
const generateBatch = async (
  topicName: string, 
  count: number, 
  batchId: number
): Promise<Question[]> => {
  const apiKey = getNextApiKey();
  
  if (!apiKey) throw new Error("No API Key available");

  const ai = new GoogleGenAI({ apiKey });
  const constraint = getFormatInstruction(topicName);

  const systemInstruction = `UPSC CDS Exam Generator. Topic: ${topicName}. 
  Task: Generate ${count} MCQs.
  Output: JSON Array. 
  Schema: id (string), text (string), options (string[]), correctAnswer (0-3 int).
  Constraint: ${constraint}`;

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Generate ${count} hard questions for ${topicName}. Batch ID: ${batchId}`,
    config: {
      systemInstruction,
      temperature: 0.6,
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
  const rawQuestions = JSON.parse(text) as any[];
  
  return rawQuestions.map((q, idx) => ({
    ...q,
    id: `${Date.now()}-${batchId}-${idx}`,
    options: q.options.slice(0, 4) // Ensure strictly 4 options
  }));
};

/**
 * WRAPPER: Retries generation with a different key if one fails.
 * This ensures that if you have 1 valid key and 4 bad ones, it eventually finds the valid one.
 */
const generateBatchWithRetry = async (
  topicName: string, 
  count: number, 
  batchId: number, 
  retries: number
): Promise<Question[]> => {
  try {
    return await generateBatch(topicName, count, batchId);
  } catch (error) {
    if (retries > 0) {
      console.warn(`[System] Batch ${batchId} failed. Switching frequency... (${retries} retries left)`);
      // Wait a bit before retrying to let the key rotation happen and rate limits cool down
      await delay(800 + Math.random() * 500); 
      return generateBatchWithRetry(topicName, count, batchId, retries - 1);
    }
    throw error;
  }
};

/**
 * PHASE 1: ROBUST PARALLEL GENERATION
 * Strategy: 3 Batches of 5 Questions = 15 Total.
 * Uses aggressive retries to handle flaky keys.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  try {
    // We launch 3 batches of 5 questions each.
    // If we have at least 1 valid API key, the retry logic will ensure all 3 succeed.
    const batchPromises = [0, 1, 2].map(async (batchId) => {
      // Stagger start times to spread load
      await delay(batchId * 600); 
      // Retry count = number of keys + 1 (to ensure we cycle through all potential keys)
      const maxRetries = Math.max(3, API_KEYS.length + 1);
      return generateBatchWithRetry(topicName, 5, batchId, maxRetries);
    });

    const results = await Promise.allSettled(batchPromises);

    const successfulQuestions = results
      .filter((r): r is PromiseFulfilledResult<Question[]> => r.status === 'fulfilled')
      .map(r => r.value)
      .flat();

    if (successfulQuestions.length > 0) {
      if (successfulQuestions.length < 15) {
        console.warn(`[System] Optimization Complete. Yield: ${successfulQuestions.length}/15.`);
      }
      return successfulQuestions;
    } else {
      throw new Error("All Intel Uplinks Failed.");
    }

  } catch (error) {
    console.error("Critical Failure:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 3: ON-DEMAND INTEL & EXPLANATION
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const apiKey = getNextApiKey();
  if (!apiKey) throw new Error("No API Key available for explanation");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Analyze this UPSC Question: "${questionText}" (${topicName})`,
    config: {
      systemInstruction: "Expert UPSC Strategist. Provide a detailed explanation of the correct answer and a strategic brief. JSON format.",
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          corePrinciple: { type: Type.STRING },
          upscContext: { type: Type.STRING },
          strategicApproach: { type: Type.STRING },
          recallHacks: { type: Type.STRING }
        },
        required: ["explanation", "corePrinciple", "upscContext", "strategicApproach", "recallHacks"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as ConceptBrief;
};

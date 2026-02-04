
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

const FAST_MODEL = "gemini-2.5-flash";

/**
 * KEY ROTATION LOGIC
 * Supports multiple API keys separated by commas.
 */
const API_KEYS = (process.env.API_KEY || "")
  .split(",")
  .map(k => k.trim())
  .filter(k => k.length > 0);

let keyIndex = 0;

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

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HELPER: Determines formatting rules.
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
 * HELPER: Generates a single batch of questions.
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

  // We lower the temperature slightly to ensure valid JSON structure
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Generate ${count} hard questions for ${topicName}. Batch ID: ${batchId}`,
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
  const rawQuestions = JSON.parse(text) as any[];
  
  return rawQuestions.map((q, idx) => ({
    ...q,
    id: `${Date.now()}-${batchId}-${idx}`,
    options: q.options.slice(0, 4) // Ensure strictly 4 options
  }));
};

/**
 * WRAPPER: Retry Logic
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
      console.warn(`[System] Batch ${batchId} failed. Rotating frequency... (${retries} retries left)`);
      await delay(1500); // Wait 1.5s before retry to clear rate limits
      return generateBatchWithRetry(topicName, count, batchId, retries - 1);
    }
    throw error;
  }
};

/**
 * MAIN: TANK MODE GENERATION (Sequential)
 * Fetches batches one by one to avoid 429 Rate Limits.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  try {
    const allQuestions: Question[] = [];
    
    // We attempt 3 batches of 5 questions each = 15 questions.
    const batches = [0, 1, 2];

    for (const batchId of batches) {
      try {
        // Add delay between successful batches to be gentle on the API
        if (batchId > 0) await delay(1000);

        // Try to generate this batch, allowing up to 3 retries (cycling keys)
        const batchQuestions = await generateBatchWithRetry(topicName, 5, batchId, 3);
        allQuestions.push(...batchQuestions);
        
      } catch (batchError) {
        console.error(`[System] Batch ${batchId} critically failed. Skipping.`);
        // We continue to the next batch even if this one fails.
        // This ensures we get *some* questions rather than *none*.
      }
    }

    // FINAL CHECK: Do we have enough questions to start?
    if (allQuestions.length > 0) {
      if (allQuestions.length < 15) {
        console.warn(`[System] Partial yield: ${allQuestions.length}/15 questions.`);
      }
      return allQuestions;
    } else {
      // Only if ALL batches failed do we throw error to trigger Vault Mode
      throw new Error("All Intel Batches failed.");
    }

  } catch (error) {
    console.error("Critical Failure:", error);
    // Return Fallback (Vault Mode)
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 3: ON-DEMAND INTEL
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const apiKey = getNextApiKey();
  if (!apiKey) throw new Error("No API Key available");

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

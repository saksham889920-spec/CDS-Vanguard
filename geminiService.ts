
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

// Helper for delay (minimal delay just to prevent browser network congestion)
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
  // Rotate key for every batch request
  const apiKey = getNextApiKey();
  
  if (!apiKey) throw new Error("No API Key available");

  const ai = new GoogleGenAI({ apiKey });
  const constraint = getFormatInstruction(topicName);

  const systemInstruction = `UPSC CDS Exam Generator. Topic: ${topicName}. 
  Task: Generate ${count} MCQs.
  Output: JSON Array. 
  Schema: id (string), text (string), options (string[]), correctAnswer (0-3 int).
  Constraint: ${constraint}`;

  // Direct call, no retries inside here. If it fails, we let the batch fail.
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
 * MAIN: FAST PARALLEL GENERATION
 * Fires 5 batches of 3 questions simultaneously.
 * Returns whatever succeeds.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  try {
    // If no keys are present, skip directly to vault
    if (API_KEYS.length === 0) {
      throw new Error("No API Keys configured");
    }

    // 5 Batches x 3 Questions = 15 Total Target
    const batches = [0, 1, 2, 3, 4];

    // Fire all requests immediately (Parallel)
    const batchPromises = batches.map(async (i) => {
      await delay(i * 300); // Increased stagger slightly to 300ms to be safer
      return generateBatch(topicName, 3, i);
    });

    // Promise.allSettled waits for all to finish (either success or fail)
    const results = await Promise.allSettled(batchPromises);

    // Filter only the successful batches
    const successfulQuestions = results
      .filter((r): r is PromiseFulfilledResult<Question[]> => r.status === 'fulfilled')
      .map(r => r.value)
      .flat();

    // LOGIC: If we have ANY questions, we return them.
    if (successfulQuestions.length > 0) {
      return successfulQuestions;
    } else {
      // Only throw if 0 questions were generated (All keys failed)
      throw new Error("All Intel Batches failed.");
    }

  } catch (error) {
    console.error("Critical Failure, switching to Offline Vault:", error);
    // Return Fallback with Topic ID for accurate offline mapping
    return getGenericFallback(topicName, topicId);
  }
};

/**
 * PHASE 3: ON-DEMAND INTEL
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  try {
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
  } catch (e) {
    // Offline Fallback for Explanations
    return {
      explanation: "Offline Mode: Explanation unavailable. Review standard textbooks.",
      corePrinciple: "Offline Vault Data",
      upscContext: "Standard Syllabus",
      strategicApproach: "Refer to class notes.",
      recallHacks: "N/A"
    };
  }
};


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

// Log key status for debugging (Safe: does not log actual keys)
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

// Helper for delay to prevent hitting rate limits instantly
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HELPER: Determines the specific formatting rule based on topic.
 */
const getFormatInstruction = (topicName: string): string => {
  const lower = topicName.toLowerCase();
  
  // English: Reading Comprehension
  if (lower.includes('reading comprehension')) {
    return "Include a short passage (4-6 sentences) followed by the question based on it.";
  }
  
  // English: Ordering (Words or Sentences)
  if (lower.includes('ordering')) {
    return "The question MUST consist of jumbled parts labeled P, Q, R, S. The options MUST be sequences like 'PQRS', 'QRSP'. Do not solve it in the question text.";
  }
  
  // English: Parts of Speech
  if (lower.includes('parts of speech')) {
    return "The question MUST contain a sentence with ONE specific word highlighted (e.g., in CAPS or quotes). Ask for the Part of Speech (Noun, Adverb, Preposition, etc.) of that word.";
  }
  
  // English: Cloze / Fillers
  if (lower.includes('cloze') || lower.includes('fill in') || lower.includes('prepositions')) {
    return "The question text MUST contain a sentence or short paragraph with a blank represented by '_______'. Options must be words/phrases to fill that blank.";
  }

  // Maths: Trigonometry / Geometry
  if (lower.includes('trigonometry') || lower.includes('geometry') || lower.includes('mensuration')) {
    return "Questions should involve calculation or conceptual application. Use standard math notation.";
  }
  
  // Default
  return "No markdown. Concise text.";
}

/**
 * HELPER: Generates a small batch of questions.
 * Used for parallel execution.
 */
const generateBatch = async (
  topicName: string, 
  count: number, 
  offset: number
): Promise<Question[]> => {
  const apiKey = getNextApiKey();
  
  // Immediate fail-safe if no keys exist, triggering the catch block in generateQuestions
  if (!apiKey) {
    throw new Error("No API Key available");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const constraint = getFormatInstruction(topicName);

  const systemInstruction = `UPSC CDS Exam Generator. Topic: ${topicName}. 
  Task: Generate ${count} MCQs.
  Output: JSON Array. 
  Schema: id (string), text (string), options (string[]), correctAnswer (0-3 int).
  Constraint: ${constraint}`;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate ${count} hard questions for ${topicName}. Batch ID: ${offset}`,
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
    
    // Ensure IDs are unique across batches
    return rawQuestions.map((q, idx) => ({
      ...q,
      id: `${Date.now()}-${offset}-${idx}`,
      options: q.options.slice(0, 4) // Ensure strictly 4 options
    }));
  } catch (error) {
    console.warn(`Batch ${offset} failed:`, error);
    throw error; // Re-throw to be caught by allSettled
  }
};

/**
 * PHASE 1: PARALLEL SPRINT (15 Questions)
 * Splits 15 questions into 5 parallel requests of 3.
 * Uses Key Rotation to distribute load.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  try {
    // Parallel Execution: Launch FIVE workers simultaneously
    // Stagger starts by 300ms to avoid hitting Rate Limit (429) spikes on a single second.
    const batchPromises = [0, 1, 2, 3, 4].map(async (offset) => {
      await delay(offset * 300); 
      return generateBatch(topicName, 3, offset);
    });

    // Use allSettled so one failure doesn't kill the entire exam
    const results = await Promise.allSettled(batchPromises);

    // Aggregate successful batches
    const successfulQuestions = results
      .filter((r): r is PromiseFulfilledResult<Question[]> => r.status === 'fulfilled')
      .map(r => r.value)
      .flat();

    // If we have at least one batch (3 questions), let the user proceed.
    // Otherwise, if completely empty, throw error to trigger Vault fallback.
    if (successfulQuestions.length > 0) {
      if (successfulQuestions.length < 15) {
        console.warn(`[System] Partial failure detected. Operating at ${successfulQuestions.length}/15 capacity.`);
      }
      return successfulQuestions;
    } else {
      throw new Error("All API channels failed.");
    }

  } catch (error) {
    console.error("Parallel Generation Failed or No Keys:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 3: ON-DEMAND INTEL & EXPLANATION
 * Fetches both the strategic brief AND the detailed explanation in one go.
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
          explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct and others are wrong." },
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


import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { getGenericFallback } from "./fallbackData.ts";

const FAST_MODEL = "gemini-2.5-flash";

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const constraint = getFormatInstruction(topicName);

  const systemInstruction = `UPSC CDS Exam Generator. Topic: ${topicName}. 
  Task: Generate ${count} MCQs.
  Output: JSON Array. 
  Schema: id (string), text (string), options (string[]), correctAnswer (0-3 int).
  Constraint: ${constraint}`;

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
};

/**
 * PHASE 1: PARALLEL SPRINT
 * Splits 10 questions into 2 parallel requests of 5.
 * Theoretical Speedup: ~40-50% faster than generating 10 sequentially.
 */
export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  try {
    // Parallel Execution: Launch two workers simultaneously
    const [batch1, batch2] = await Promise.all([
      generateBatch(topicName, 5, 0),
      generateBatch(topicName, 5, 1)
    ]);
    
    return [...batch1, ...batch2];
  } catch (error) {
    console.error("Parallel Generation Failed:", error);
    return getGenericFallback(topicName);
  }
};

/**
 * PHASE 3: ON-DEMAND INTEL & EXPLANATION
 * Fetches both the strategic brief AND the detailed explanation in one go.
 */
export const getDetailedConceptBrief = async (questionText: string, topicName: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

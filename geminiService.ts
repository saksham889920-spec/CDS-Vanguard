
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { FALLBACK_QUESTIONS, getGenericFallback } from "./fallbackData.ts";

// Initialize GenAI client strictly using the environment variable named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  // Switch to gemini-3-flash-preview for significantly faster performance and higher reliability
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert UPSC (CDS) Exam Content Strategist. 
    Generate 10 high-quality, conceptual MCQs for the Combined Defence Services exam. 
    
    STRICT RULES:
    1. MATCH CDS DIFFICULTY: Questions must be analytical and application-based.
    2. SUBJECT CONTEXT: For ${section}, focus on ${subjectName} core concepts.
    3. TOPIC: Strictly about ${topicName}.
    4. VARIETY: Use a mix of direct conceptual questions and statement-based questions (Statement I and Statement II).
    5. No repetitive or low-level questions.
  `;

  const prompt = `Generate exactly 10 unique MCQs for CDS: ${section} -> ${subjectName} -> ${topicName}. 
    Response must be a JSON array of 10 objects.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index 0-3" },
              explanation: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    const parsed = JSON.parse(text) as Question[];
    // Ensure we only return 10 even if AI returns more
    return parsed.slice(0, 10);
  } catch (error) {
    console.error("Gemini API Error:", error);
    const specific = FALLBACK_QUESTIONS[topicId];
    if (specific && specific.length >= 10) return specific.slice(0, 10);
    // Generic fallback is now also 10 questions
    return getGenericFallback(topicName);
  }
};

export const getDetailedConceptBrief = async (question: string, topic: string): Promise<ConceptBrief> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide a structured UPSC study brief for a CDS candidate on the specific concept used in this question: "${question}" within the broader topic of "${topic}".`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior UPSC mentor. Deliver high-density, strategic concepts in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            corePrinciple: { type: Type.STRING },
            upscContext: { type: Type.STRING },
            strategicApproach: { type: Type.ARRAY, items: { type: Type.STRING } },
            recallHacks: { type: Type.STRING }
          },
          required: ["corePrinciple", "upscContext", "strategicApproach", "recallHacks"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as ConceptBrief;
  } catch (error) {
    console.error("Brief API Error:", error);
    return {
      corePrinciple: "The fundamental logic involves analyzing the structural relationship between the given elements.",
      upscContext: "UPSC focuses on application-based questions for this module.",
      strategicApproach: ["Analyze the given statements carefully.", "Eliminate logically impossible options first.", "Cross-reference with foundational NCERT concepts."],
      recallHacks: "Think of this as the building block for advanced modules in this subject."
    };
  }
};

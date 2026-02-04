
import { GoogleGenAI, Type } from "@google/genai";
import { Question, SectionType, ConceptBrief } from "./types.ts";
import { FALLBACK_QUESTIONS, getGenericFallback } from "./fallbackData.ts";

export const generateQuestions = async (
  section: SectionType,
  subjectName: string,
  topicId: string,
  topicName: string
): Promise<Question[]> => {
  // Initialize instance inside the call to ensure fresh access to injected env vars
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert UPSC (CDS) Exam Content Strategist. 
    Generate exactly 10 high-quality, conceptual MCQs for the Combined Defence Services exam. 
    
    STRICT RULES:
    1. MATCH CDS DIFFICULTY: Questions must be analytical and application-based.
    2. SUBJECT CONTEXT: For ${section}, focus on ${subjectName} core concepts.
    3. TOPIC: Strictly about ${topicName}.
    4. VARIETY: Use a mix of direct conceptual questions and statement-based questions.
    5. No repetitive or low-level questions.
    6. Return valid JSON.
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

    let text = response.text || "";
    // Clean any accidental markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    if (!text) throw new Error("Empty AI response");
    
    const parsed = JSON.parse(text) as Question[];
    return parsed.slice(0, 10);
  } catch (error) {
    console.error("Gemini API Error - Reverting to Vault:", error);
    const specific = FALLBACK_QUESTIONS[topicId];
    if (specific && specific.length >= 10) return specific.slice(0, 10);
    return getGenericFallback(topicName);
  }
};

export const getDetailedConceptBrief = async (question: string, topic: string): Promise<ConceptBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    
    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as ConceptBrief;
  } catch (error) {
    console.error("Brief API Error:", error);
    return {
      corePrinciple: "The fundamental logic involves analyzing the structural relationship between the given elements.",
      upscContext: "UPSC focuses on application-based questions for this module.",
      strategicApproach: ["Analyze the given statements carefully.", "Eliminate logically impossible options first.", "Cross-reference with foundational NCERT concepts."],
      recallHacks: "Focus on the timeline of events for this specific topic."
    };
  }
};

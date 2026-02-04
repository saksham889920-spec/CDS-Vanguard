
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
  // Use gemini-3-pro-preview for complex reasoning and academic content generation
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are an expert UPSC (CDS) Exam Content Strategist. 
    Generate 10 high-quality, conceptual MCQs. 
    
    STRICT RULES:
    1. MATCH CDS DIFFICULTY: Questions must be analytical, not rote-learning based.
    2. ENGLISH: For 'Ordering of Sentences', provide a starting sentence (S1), an ending sentence (S6), and four intermediate sentences (P, Q, R, S) to be arranged.
    3. MATHS: Focus on 'Theorem-based' problems, properties of figures, and complex algebraic identities.
    4. GK: Use 'Statement-based' questions.
    5. No repetitive questions.
  `;

  const prompt = `Generate 10 unique MCQs for CDS: ${section} -> ${subjectName} -> ${topicName}. 
    Response must be a JSON array of objects with id, text, options (4), correctAnswer (0-3), and explanation.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
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

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.warn("API Error, using fallback data:", error);
    const specific = FALLBACK_QUESTIONS[topicId];
    if (specific && specific.length >= 10) return specific.slice(0, 10);
    return getGenericFallback(topicName);
  }
};

export const getDetailedConceptBrief = async (question: string, topic: string): Promise<ConceptBrief> => {
  // Use gemini-3-pro-preview for high-density strategic educational content
  const model = "gemini-3-pro-preview";
  const prompt = `Provide a structured study brief for a CDS candidate on: "${question}" within the topic "${topic}".`;

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
            corePrinciple: { type: Type.STRING, description: "Detailed yet concise explanation of the concept's logic." },
            upscContext: { type: Type.STRING, description: "Why this matters for CDS and recent trends." },
            strategicApproach: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "3-4 actionable steps or tricks to solve similar problems." 
            },
            recallHacks: { type: Type.STRING, description: "Any mnemonics, simple analogies, or memory hooks." }
          },
          required: ["corePrinciple", "upscContext", "strategicApproach", "recallHacks"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return JSON.parse(text) as ConceptBrief;
  } catch (error) {
    return {
      corePrinciple: "The fundamental logic involves analyzing the structural relationship between the given elements.",
      upscContext: "UPSC focuses on application-based questions for this module.",
      strategicApproach: ["Analyze the given statements carefully.", "Eliminate logically impossible options first.", "Cross-reference with foundational NCERT concepts."],
      recallHacks: "Think of this as the building block for advanced modules in this subject."
    };
  }
};

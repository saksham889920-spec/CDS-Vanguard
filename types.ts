
export enum SectionType {
  ENGLISH = 'English',
  MATHEMATICS = 'Elementary Mathematics',
  GK = 'General Knowledge'
}

export type MasteryStatus = 'LOCKED' | 'NEEDS_REVIEW' | 'PRACTICING' | 'MASTERED';

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  section: SectionType;
  icon: string;
  categories?: Category[];
  topics?: Topic[];
}

export interface ConceptBrief {
  corePrinciple: string;
  upscContext: string;
  strategicApproach: string;
  recallHacks: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // REQUIRED: Generated in Phase 1 for accuracy
  explanation?: string;  // Optional: Loaded in Phase 2
  intelBrief?: ConceptBrief; // Optional: Loaded in Phase 2
}

export interface UserResponse {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

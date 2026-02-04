
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
  explanation: string; // Moved here for on-demand loading
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
  explanation?: string;  // Deprecated in favor of on-demand Intel
  intelBrief?: ConceptBrief; // Optional: Loaded in Phase 3
}

export interface UserResponse {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

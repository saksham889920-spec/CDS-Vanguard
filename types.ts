
export enum SectionType {
  ENGLISH = 'English',
  MATHEMATICS = 'Elementary Mathematics',
  GK = 'General Knowledge'
}

export type MasteryStatus = 'LOCKED' | 'NEEDS_REVIEW' | 'PRACTICING' | 'MASTERED';

export interface TopicProgress {
  topicId: string;
  bestScore: number;
  attempts: number;
  status: MasteryStatus;
}

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
  // Added missing section property to Subject interface to match usage in constants.ts and App.tsx
  section: SectionType;
  icon: string;
  categories?: Category[];
  topics?: Topic[];
}

export interface ConceptBrief {
  corePrinciple: string;
  upscContext: string;
  strategicApproach: string[];
  recallHacks: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  intelBrief?: ConceptBrief; // Now bundled for speed
}

export interface UserResponse {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

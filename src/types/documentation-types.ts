export interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  lastUpdated: string;
  tags?: string[];
}

export interface DocumentCategory {
  id: string;
  name: string;
  documents: Document[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  items: FAQItem[];
}

export interface TutorialStep {
  title: string;
  content: string;
  videoUrl?: string;
  resources?: {
    title: string;
    description: string;
    url: string;
  }[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnailUrl?: string;
  categories: string[];
  steps: TutorialStep[];
}
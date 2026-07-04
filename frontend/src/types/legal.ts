export interface LegalQARequest {
  question: string;
  jurisdiction: string;
  category?: string;
  context?: string;
}

export interface LegalSource {
  title: string;
  url: string;
  relevance: number;
  snippet: string;
}

export interface LegalQAResponse {
  id: string;
  question: string;
  answer: string;
  jurisdiction: string;
  category: string;
  sources: LegalSource[];
  confidence: number;
  created_at: string;
  disclaimer: string;
}

export interface LegalQAHistoryItem {
  id: string;
  question: string;
  answer: string;
  jurisdiction: string;
  created_at: string;
}

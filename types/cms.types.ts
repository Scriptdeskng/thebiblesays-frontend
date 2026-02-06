export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FAQ[];
}
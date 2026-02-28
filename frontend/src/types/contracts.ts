export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Clause {
  id: string;
  type: string;
  title: string;
  description: string;
  original_text: string;
  risk_level: RiskLevel;
  recommendation: string;
  section: string;
}

export interface ContractReview {
  id: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  status: "pending" | "processing" | "completed" | "failed";
  overall_risk: RiskLevel;
  summary: string;
  clauses: Clause[];
  total_clauses: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  disclaimer: string;
}

export interface EmploymentStandard {
  id: string;
  jurisdiction: string;
  category: string;
  title: string;
  description: string;
  requirements: string[];
  penalties: string;
  last_updated: string;
  source_url: string;
}

export interface ComplianceChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  completed: boolean;
  notes: string;
  references: string[];
}

export interface ComplianceChecklist {
  id: string;
  name: string;
  jurisdiction: string;
  industry: string;
  items: ComplianceChecklistItem[];
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  disclaimer: string;
}

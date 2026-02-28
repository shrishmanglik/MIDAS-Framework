export interface CRSInput {
  age: number;
  education_level: string;
  canadian_education: boolean;
  first_language_test: string;
  first_language_speaking: number;
  first_language_listening: number;
  first_language_reading: number;
  first_language_writing: number;
  second_language_test: string;
  second_language_speaking: number;
  second_language_listening: number;
  second_language_reading: number;
  second_language_writing: number;
  canadian_work_experience_years: number;
  foreign_work_experience_years: number;
  certificate_of_qualification: boolean;
  provincial_nomination: boolean;
  arranged_employment: boolean;
  siblings_in_canada: boolean;
  spouse_education_level: string;
  spouse_language_speaking: number;
  spouse_language_listening: number;
  spouse_language_reading: number;
  spouse_language_writing: number;
  spouse_canadian_work_experience_years: number;
  marital_status: string;
}

export interface CRSBreakdown {
  core_human_capital: number;
  spouse_factors: number;
  skill_transferability: number;
  additional_points: number;
}

export interface CRSResult {
  total_score: number;
  breakdown: CRSBreakdown;
  eligible_programs: string[];
  disclaimer: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  minimum_score: number;
  category: string;
  requirements: string[];
  is_eligible: boolean;
}

export interface PostLandingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  timeline: string;
  completed: boolean;
  resources: string[];
}

export interface DrawResult {
  id: string;
  draw_number: number;
  date: string;
  program: string;
  minimum_score: number;
  invitations_issued: number;
}

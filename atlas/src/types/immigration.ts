export interface LanguageScores {
  reading: number;
  writing: number;
  listening: number;
  speaking: number;
}

export interface SpouseFactors {
  education_level?: string;
  language_scores?: LanguageScores;
  canadian_work_experience?: number;
}

export interface CRSInput {
  age: number;
  education_level: string;
  first_language_scores: LanguageScores;
  second_language_scores?: LanguageScores;
  canadian_work_experience: number;
  foreign_work_experience?: number;
  certificate_of_qualification?: boolean;
  provincial_nomination?: boolean;
  job_offer?: string;
  canadian_education?: string;
  spouse_factors?: SpouseFactors;
}

export interface CRSResult {
  total_score: number;
  breakdown: Record<string, number>;
  eligible_programs: string[];
}

export interface Program {
  id: string;
  name: string;
  province: string;
  program_type: string;
  min_crs_score: number;
  requirements: Record<string, unknown>;
}

export interface PostLandingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  days_after_arrival: number;
  url?: string;
}

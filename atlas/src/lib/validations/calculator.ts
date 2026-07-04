import { z } from "zod";

const languageScoresSchema = z.object({
  reading: z
    .number()
    .min(0, "Score must be at least 0")
    .max(10, "Score must be at most 10"),
  writing: z
    .number()
    .min(0, "Score must be at least 0")
    .max(10, "Score must be at most 10"),
  listening: z
    .number()
    .min(0, "Score must be at least 0")
    .max(10, "Score must be at most 10"),
  speaking: z
    .number()
    .min(0, "Score must be at least 0")
    .max(10, "Score must be at most 10"),
});

const spouseFactorsSchema = z
  .object({
    education_level: z.string().optional(),
    language_scores: languageScoresSchema.optional(),
    canadian_work_experience: z
      .number()
      .min(0)
      .max(5)
      .optional(),
  })
  .optional();

export const crsInputSchema = z.object({
  age: z
    .number()
    .min(18, "Must be at least 18 years old")
    .max(65, "Must be at most 65 years old"),
  education_level: z
    .string()
    .min(1, "Education level is required"),
  first_language_scores: languageScoresSchema,
  second_language_scores: languageScoresSchema.optional(),
  canadian_work_experience: z
    .number()
    .min(0, "Cannot be negative")
    .max(10, "Maximum 10 years"),
  foreign_work_experience: z
    .number()
    .min(0, "Cannot be negative")
    .max(10, "Maximum 10 years")
    .optional(),
  certificate_of_qualification: z.boolean().optional(),
  provincial_nomination: z.boolean().optional(),
  job_offer: z.string().optional(),
  canadian_education: z.string().optional(),
  spouse_factors: spouseFactorsSchema,
});

export type CRSInputSchema = z.infer<typeof crsInputSchema>;

export const EDUCATION_LEVELS = [
  { value: "less_than_secondary", label: "Less than secondary school" },
  { value: "secondary", label: "Secondary school diploma" },
  {
    value: "one_year_post_secondary",
    label: "One-year post-secondary program",
  },
  {
    value: "two_year_post_secondary",
    label: "Two-year post-secondary program",
  },
  { value: "bachelors", label: "Bachelor's degree" },
  {
    value: "two_or_more_post_secondary",
    label: "Two or more post-secondary programs",
  },
  { value: "masters", label: "Master's degree" },
  {
    value: "doctoral",
    label: "Doctoral level (PhD)",
  },
] as const;

export const JOB_OFFER_TYPES = [
  { value: "", label: "No job offer" },
  { value: "noc_00", label: "NOC 00 (Senior management)" },
  { value: "noc_0_a_b", label: "NOC 0, A, or B" },
  { value: "noc_c_d", label: "NOC C or D" },
] as const;

export const CANADIAN_EDUCATION_LEVELS = [
  { value: "", label: "None" },
  {
    value: "one_or_two_year",
    label: "One- or two-year credential",
  },
  {
    value: "three_year_or_more",
    label: "Three-year or longer credential",
  },
] as const;

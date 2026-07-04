import { z } from "zod";

export const crsInputSchema = z.object({
  age: z.number().min(18, "Must be at least 18").max(65, "Must be 65 or under"),
  education_level: z.enum([
    "none",
    "high_school",
    "one_year_diploma",
    "two_year_diploma",
    "bachelors",
    "two_or_more_degrees",
    "masters",
    "doctoral",
  ]),
  canadian_education: z.boolean(),
  first_language_test: z.enum(["ielts", "celpip", "tef", "tcf"]),
  first_language_speaking: z
    .number()
    .min(0, "Score cannot be negative")
    .max(12, "Maximum score is 12"),
  first_language_listening: z
    .number()
    .min(0, "Score cannot be negative")
    .max(12, "Maximum score is 12"),
  first_language_reading: z
    .number()
    .min(0, "Score cannot be negative")
    .max(12, "Maximum score is 12"),
  first_language_writing: z
    .number()
    .min(0, "Score cannot be negative")
    .max(12, "Maximum score is 12"),
  second_language_test: z.enum(["none", "ielts", "celpip", "tef", "tcf"]),
  second_language_speaking: z.number().min(0).max(12),
  second_language_listening: z.number().min(0).max(12),
  second_language_reading: z.number().min(0).max(12),
  second_language_writing: z.number().min(0).max(12),
  canadian_work_experience_years: z
    .number()
    .min(0)
    .max(10, "Maximum is 10 years"),
  foreign_work_experience_years: z
    .number()
    .min(0)
    .max(10, "Maximum is 10 years"),
  certificate_of_qualification: z.boolean(),
  provincial_nomination: z.boolean(),
  arranged_employment: z.boolean(),
  siblings_in_canada: z.boolean(),
  spouse_education_level: z.enum([
    "none",
    "high_school",
    "one_year_diploma",
    "two_year_diploma",
    "bachelors",
    "two_or_more_degrees",
    "masters",
    "doctoral",
  ]),
  spouse_language_speaking: z.number().min(0).max(12),
  spouse_language_listening: z.number().min(0).max(12),
  spouse_language_reading: z.number().min(0).max(12),
  spouse_language_writing: z.number().min(0).max(12),
  spouse_canadian_work_experience_years: z.number().min(0).max(10),
  marital_status: z.enum(["single", "married", "common_law"]),
});

export type CRSInputFormData = z.infer<typeof crsInputSchema>;

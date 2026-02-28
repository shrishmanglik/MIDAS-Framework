"use client";

import { useState, useCallback } from "react";
import { calculateCRS } from "@/lib/api/immigration";
import type { CRSInput, CRSResult } from "@/types/immigration";

const defaultCRSInput: CRSInput = {
  age: 25,
  education_level: "bachelors",
  canadian_education: false,
  first_language_test: "ielts",
  first_language_speaking: 0,
  first_language_listening: 0,
  first_language_reading: 0,
  first_language_writing: 0,
  second_language_test: "none",
  second_language_speaking: 0,
  second_language_listening: 0,
  second_language_reading: 0,
  second_language_writing: 0,
  canadian_work_experience_years: 0,
  foreign_work_experience_years: 0,
  certificate_of_qualification: false,
  provincial_nomination: false,
  arranged_employment: false,
  siblings_in_canada: false,
  spouse_education_level: "none",
  spouse_language_speaking: 0,
  spouse_language_listening: 0,
  spouse_language_reading: 0,
  spouse_language_writing: 0,
  spouse_canadian_work_experience_years: 0,
  marital_status: "single",
};

export function useCRSCalculator() {
  const [input, setInput] = useState<CRSInput>(defaultCRSInput);
  const [result, setResult] = useState<CRSResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const updateField = useCallback(
    <K extends keyof CRSInput>(field: K, value: CRSInput[K]) => {
      setInput((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await calculateCRS(input);
      setResult(response.data);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to calculate CRS score";
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [input]);

  const reset = useCallback(() => {
    setInput(defaultCRSInput);
    setResult(null);
    setError(null);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    input,
    result,
    isSubmitting,
    error,
    currentStep,
    updateField,
    submit,
    reset,
    nextStep,
    prevStep,
    setCurrentStep,
  };
}

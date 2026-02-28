"use client";

import { useState, useCallback } from "react";
import type { CRSInput, CRSResult } from "@/types/immigration";
import { calculateCRS, matchPathways } from "@/lib/api/immigration";
import type { Program } from "@/types/immigration";

export interface CRSCalculatorState {
  step: number;
  input: Partial<CRSInput>;
  result: CRSResult | null;
  matchedPrograms: Program[];
  isCalculating: boolean;
  error: string | null;
}

const TOTAL_STEPS = 4;

const DEFAULT_INPUT: Partial<CRSInput> = {
  age: 25,
  education_level: "",
  first_language_scores: { reading: 0, writing: 0, listening: 0, speaking: 0 },
  canadian_work_experience: 0,
  foreign_work_experience: 0,
  certificate_of_qualification: false,
  provincial_nomination: false,
};

export function useCRSCalculator() {
  const [state, setState] = useState<CRSCalculatorState>({
    step: 1,
    input: DEFAULT_INPUT,
    result: null,
    matchedPrograms: [],
    isCalculating: false,
    error: null,
  });

  const updateInput = useCallback((updates: Partial<CRSInput>) => {
    setState((prev) => ({
      ...prev,
      input: { ...prev.input, ...updates },
      error: null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, TOTAL_STEPS),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      step: Math.max(1, Math.min(step, TOTAL_STEPS)),
    }));
  }, []);

  const submit = useCallback(async () => {
    setState((prev) => ({ ...prev, isCalculating: true, error: null }));

    try {
      const fullInput = state.input as CRSInput;
      const [result, programs] = await Promise.all([
        calculateCRS(fullInput),
        matchPathways(fullInput),
      ]);

      setState((prev) => ({
        ...prev,
        result,
        matchedPrograms: programs,
        isCalculating: false,
        step: TOTAL_STEPS,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Calculation failed";
      setState((prev) => ({
        ...prev,
        isCalculating: false,
        error: message,
      }));
    }
  }, [state.input]);

  const reset = useCallback(() => {
    setState({
      step: 1,
      input: DEFAULT_INPUT,
      result: null,
      matchedPrograms: [],
      isCalculating: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    totalSteps: TOTAL_STEPS,
    updateInput,
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
  };
}

"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EDUCATION_LEVELS,
  JOB_OFFER_TYPES,
  CANADIAN_EDUCATION_LEVELS,
} from "@/lib/validations/calculator";
import type { CRSInput, LanguageScores } from "@/types/immigration";

interface CRSFormProps {
  step: number;
  totalSteps: number;
  input: Partial<CRSInput>;
  isCalculating: boolean;
  error: string | null;
  onUpdateInput: (updates: Partial<CRSInput>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSubmit: () => void;
}

const STEP_TITLES = [
  "Personal Information",
  "Language Proficiency",
  "Work Experience",
  "Additional Factors",
];

export function CRSForm({
  step,
  totalSteps,
  input,
  isCalculating,
  error,
  onUpdateInput,
  onNextStep,
  onPrevStep,
  onSubmit,
}: CRSFormProps) {
  const progressPercent = (step / totalSteps) * 100;

  const handleLanguageChange = useCallback(
    (
      field: "first_language_scores" | "second_language_scores",
      skill: keyof LanguageScores,
      value: string
    ) => {
      const currentScores = input[field] || {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
      };
      onUpdateInput({
        [field]: {
          ...currentScores,
          [skill]: parseFloat(value) || 0,
        },
      });
    },
    [input, onUpdateInput]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <span className="font-medium text-primary">
            {STEP_TITLES[step - 1]}
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={65}
                value={input.age ?? ""}
                onChange={(e) =>
                  onUpdateInput({ age: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter your age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select
                value={input.education_level || ""}
                onValueChange={(value) =>
                  onUpdateInput({ education_level: value })
                }
              >
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>First Official Language (CLB/NCLC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {(["reading", "writing", "listening", "speaking"] as const).map(
              (skill) => (
                <div key={skill} className="space-y-2">
                  <Label htmlFor={`first-${skill}`} className="capitalize">
                    {skill}
                  </Label>
                  <Input
                    id={`first-${skill}`}
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={input.first_language_scores?.[skill] ?? ""}
                    onChange={(e) =>
                      handleLanguageChange(
                        "first_language_scores",
                        skill,
                        e.target.value
                      )
                    }
                    placeholder={`CLB level (0-10)`}
                  />
                </div>
              )
            )}

            <div className="border-t border-border pt-5">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Second Official Language (optional)
              </p>
              {(["reading", "writing", "listening", "speaking"] as const).map(
                (skill) => (
                  <div key={`second-${skill}`} className="mb-4 space-y-2">
                    <Label
                      htmlFor={`second-${skill}`}
                      className="capitalize text-muted-foreground"
                    >
                      {skill}
                    </Label>
                    <Input
                      id={`second-${skill}`}
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={input.second_language_scores?.[skill] ?? ""}
                      onChange={(e) =>
                        handleLanguageChange(
                          "second_language_scores",
                          skill,
                          e.target.value
                        )
                      }
                      placeholder={`CLB level (0-10)`}
                    />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="canadian-exp">
                Canadian Work Experience (years)
              </Label>
              <Input
                id="canadian-exp"
                type="number"
                min={0}
                max={10}
                value={input.canadian_work_experience ?? ""}
                onChange={(e) =>
                  onUpdateInput({
                    canadian_work_experience: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Years of Canadian experience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foreign-exp">
                Foreign Work Experience (years)
              </Label>
              <Input
                id="foreign-exp"
                type="number"
                min={0}
                max={10}
                value={input.foreign_work_experience ?? ""}
                onChange={(e) =>
                  onUpdateInput({
                    foreign_work_experience: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Years of foreign experience"
              />
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border p-4">
              <input
                id="certificate"
                type="checkbox"
                checked={input.certificate_of_qualification ?? false}
                onChange={(e) =>
                  onUpdateInput({
                    certificate_of_qualification: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded border-border accent-primary"
              />
              <Label htmlFor="certificate" className="cursor-pointer text-base">
                Certificate of Qualification (trades)
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 rounded-md border border-border p-4">
              <input
                id="pnp"
                type="checkbox"
                checked={input.provincial_nomination ?? false}
                onChange={(e) =>
                  onUpdateInput({ provincial_nomination: e.target.checked })
                }
                className="h-5 w-5 rounded border-border accent-primary"
              />
              <Label htmlFor="pnp" className="cursor-pointer text-base">
                Provincial Nomination (PNP)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-offer">Arranged Employment</Label>
              <Select
                value={input.job_offer || ""}
                onValueChange={(value) =>
                  onUpdateInput({ job_offer: value || undefined })
                }
              >
                <SelectTrigger id="job-offer">
                  <SelectValue placeholder="Select job offer type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_OFFER_TYPES.map((type) => (
                    <SelectItem
                      key={type.value || "none"}
                      value={type.value || "none"}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canadian-edu">Canadian Education</Label>
              <Select
                value={input.canadian_education || ""}
                onValueChange={(value) =>
                  onUpdateInput({ canadian_education: value || undefined })
                }
              >
                <SelectTrigger id="canadian-edu">
                  <SelectValue placeholder="Select Canadian education" />
                </SelectTrigger>
                <SelectContent>
                  {CANADIAN_EDUCATION_LEVELS.map((level) => (
                    <SelectItem
                      key={level.value || "none"}
                      value={level.value || "none"}
                    >
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onPrevStep}
          >
            Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button size="lg" className="flex-1" onClick={onNextStep}>
            Continue
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1"
            onClick={onSubmit}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate CRS Score"}
          </Button>
        )}
      </div>
    </div>
  );
}

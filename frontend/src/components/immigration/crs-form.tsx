"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCRSCalculator } from "@/lib/hooks/use-crs-calculator";
import { ChevronLeft, ChevronRight, Calculator, Loader2 } from "lucide-react";

const STEPS = [
  "Personal Info",
  "Education",
  "Language Scores",
  "Work Experience",
  "Additional Factors",
];

const EDUCATION_LEVELS = [
  { value: "none", label: "No formal education" },
  { value: "high_school", label: "High school diploma" },
  { value: "one_year_diploma", label: "One-year diploma/certificate" },
  { value: "two_year_diploma", label: "Two-year diploma/certificate" },
  { value: "bachelors", label: "Bachelor's degree" },
  { value: "two_or_more_degrees", label: "Two or more degrees" },
  { value: "masters", label: "Master's degree" },
  { value: "doctoral", label: "Doctoral degree (PhD)" },
];

const LANGUAGE_TESTS = [
  { value: "ielts", label: "IELTS General" },
  { value: "celpip", label: "CELPIP-G" },
  { value: "tef", label: "TEF Canada" },
  { value: "tcf", label: "TCF Canada" },
];

interface CRSFormProps {
  onResult: () => void;
}

export function CRSForm({ onResult }: CRSFormProps) {
  const {
    input,
    isSubmitting,
    error,
    currentStep,
    updateField,
    submit,
    nextStep,
    prevStep,
  } = useCRSCalculator();

  const handleSubmit = async () => {
    const result = await submit();
    if (result) {
      onResult();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          CRS Score Calculator
        </CardTitle>
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden h-0.5 w-8 sm:block ${
                    index < currentStep ? "bg-primary" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {currentStep + 1}: {STEPS[currentStep]}
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={18}
                max={65}
                value={input.age}
                onChange={(e) => updateField("age", parseInt(e.target.value) || 18)}
              />
            </div>
            <div>
              <Label htmlFor="marital_status">Marital Status</Label>
              <Select
                value={input.marital_status}
                onValueChange={(value) => updateField("marital_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="common_law">Common-law</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="education_level">Education Level</Label>
              <Select
                value={input.education_level}
                onValueChange={(value) => updateField("education_level", value)}
              >
                <SelectTrigger>
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="canadian_education"
                checked={input.canadian_education}
                onChange={(e) =>
                  updateField("canadian_education", e.target.checked)
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="canadian_education">
                I have Canadian education credentials
              </Label>
            </div>
            {input.marital_status !== "single" && (
              <div>
                <Label htmlFor="spouse_education_level">
                  Spouse Education Level
                </Label>
                <Select
                  value={input.spouse_education_level}
                  onValueChange={(value) =>
                    updateField("spouse_education_level", value)
                  }
                >
                  <SelectTrigger>
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
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 font-medium text-foreground">
                First Official Language
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="first_language_test">Language Test</Label>
                  <Select
                    value={input.first_language_test}
                    onValueChange={(value) =>
                      updateField("first_language_test", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_TESTS.map((test) => (
                        <SelectItem key={test.value} value={test.value}>
                          {test.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_speaking">Speaking (CLB)</Label>
                    <Input
                      id="first_speaking"
                      type="number"
                      min={0}
                      max={12}
                      value={input.first_language_speaking}
                      onChange={(e) =>
                        updateField(
                          "first_language_speaking",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_listening">Listening (CLB)</Label>
                    <Input
                      id="first_listening"
                      type="number"
                      min={0}
                      max={12}
                      value={input.first_language_listening}
                      onChange={(e) =>
                        updateField(
                          "first_language_listening",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_reading">Reading (CLB)</Label>
                    <Input
                      id="first_reading"
                      type="number"
                      min={0}
                      max={12}
                      value={input.first_language_reading}
                      onChange={(e) =>
                        updateField(
                          "first_language_reading",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_writing">Writing (CLB)</Label>
                    <Input
                      id="first_writing"
                      type="number"
                      min={0}
                      max={12}
                      value={input.first_language_writing}
                      onChange={(e) =>
                        updateField(
                          "first_language_writing",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-foreground">
                Second Official Language
              </h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="second_language_test">Language Test</Label>
                  <Select
                    value={input.second_language_test}
                    onValueChange={(value) =>
                      updateField("second_language_test", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {LANGUAGE_TESTS.map((test) => (
                        <SelectItem key={test.value} value={test.value}>
                          {test.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {input.second_language_test !== "none" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="second_speaking">Speaking (CLB)</Label>
                      <Input
                        id="second_speaking"
                        type="number"
                        min={0}
                        max={12}
                        value={input.second_language_speaking}
                        onChange={(e) =>
                          updateField(
                            "second_language_speaking",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="second_listening">Listening (CLB)</Label>
                      <Input
                        id="second_listening"
                        type="number"
                        min={0}
                        max={12}
                        value={input.second_language_listening}
                        onChange={(e) =>
                          updateField(
                            "second_language_listening",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="second_reading">Reading (CLB)</Label>
                      <Input
                        id="second_reading"
                        type="number"
                        min={0}
                        max={12}
                        value={input.second_language_reading}
                        onChange={(e) =>
                          updateField(
                            "second_language_reading",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="second_writing">Writing (CLB)</Label>
                      <Input
                        id="second_writing"
                        type="number"
                        min={0}
                        max={12}
                        value={input.second_language_writing}
                        onChange={(e) =>
                          updateField(
                            "second_language_writing",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {input.marital_status !== "single" && (
              <div>
                <h4 className="mb-3 font-medium text-foreground">
                  Spouse Language Scores (CLB)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="spouse_speaking">Speaking</Label>
                    <Input
                      id="spouse_speaking"
                      type="number"
                      min={0}
                      max={12}
                      value={input.spouse_language_speaking}
                      onChange={(e) =>
                        updateField(
                          "spouse_language_speaking",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse_listening">Listening</Label>
                    <Input
                      id="spouse_listening"
                      type="number"
                      min={0}
                      max={12}
                      value={input.spouse_language_listening}
                      onChange={(e) =>
                        updateField(
                          "spouse_language_listening",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse_reading">Reading</Label>
                    <Input
                      id="spouse_reading"
                      type="number"
                      min={0}
                      max={12}
                      value={input.spouse_language_reading}
                      onChange={(e) =>
                        updateField(
                          "spouse_language_reading",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse_writing">Writing</Label>
                    <Input
                      id="spouse_writing"
                      type="number"
                      min={0}
                      max={12}
                      value={input.spouse_language_writing}
                      onChange={(e) =>
                        updateField(
                          "spouse_language_writing",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="canadian_work">
                Canadian Work Experience (years)
              </Label>
              <Input
                id="canadian_work"
                type="number"
                min={0}
                max={10}
                value={input.canadian_work_experience_years}
                onChange={(e) =>
                  updateField(
                    "canadian_work_experience_years",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="foreign_work">
                Foreign Work Experience (years)
              </Label>
              <Input
                id="foreign_work"
                type="number"
                min={0}
                max={10}
                value={input.foreign_work_experience_years}
                onChange={(e) =>
                  updateField(
                    "foreign_work_experience_years",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            {input.marital_status !== "single" && (
              <div>
                <Label htmlFor="spouse_canadian_work">
                  Spouse Canadian Work Experience (years)
                </Label>
                <Input
                  id="spouse_canadian_work"
                  type="number"
                  min={0}
                  max={10}
                  value={input.spouse_canadian_work_experience_years}
                  onChange={(e) =>
                    updateField(
                      "spouse_canadian_work_experience_years",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="certificate_of_qualification"
                  checked={input.certificate_of_qualification}
                  onChange={(e) =>
                    updateField(
                      "certificate_of_qualification",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="certificate_of_qualification">
                  Certificate of qualification (trade occupation)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="provincial_nomination"
                  checked={input.provincial_nomination}
                  onChange={(e) =>
                    updateField("provincial_nomination", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="provincial_nomination">
                  Provincial or territorial nomination
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="arranged_employment"
                  checked={input.arranged_employment}
                  onChange={(e) =>
                    updateField("arranged_employment", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="arranged_employment">
                  Valid job offer (arranged employment)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="siblings_in_canada"
                  checked={input.siblings_in_canada}
                  onChange={(e) =>
                    updateField("siblings_in_canada", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="siblings_in_canada">
                  Sibling(s) living in Canada (citizen or PR)
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate CRS Score
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

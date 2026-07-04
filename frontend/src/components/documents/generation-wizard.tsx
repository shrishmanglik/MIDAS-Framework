"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateBrowser } from "@/components/documents/template-browser";
import { generateDocument } from "@/lib/api/documents";
import {
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Loader2,
  Download,
  RotateCcw,
} from "lucide-react";
import type { Template, GeneratedDocument } from "@/types/documents";

const WIZARD_STEPS = ["Select Template", "Fill Variables", "Preview & Download"];

export function GenerationWizard() {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const defaultVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      defaultVars[v.name] = v.default_value || "";
    });
    setVariables(defaultVars);
    setStep(1);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateDocument({
        template_id: selectedTemplate.id,
        variables,
      });
      setGeneratedDoc(response.data);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate document. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedTemplate(null);
    setVariables({});
    setGeneratedDoc(null);
    setError(null);
  };

  const allRequiredFilled = selectedTemplate
    ? selectedTemplate.variables
        .filter((v) => v.required)
        .every((v) => variables[v.name]?.trim())
    : false;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {WIZARD_STEPS.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                index === step
                  ? "bg-primary text-primary-foreground"
                  : index < step
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                index === step
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 ${
                  index < step ? "bg-primary" : "bg-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 0 && (
        <TemplateBrowser onSelectTemplate={handleSelectTemplate} />
      )}

      {step === 1 && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Fill in: {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTemplate.variables.map((variable) => (
                <div key={variable.name}>
                  <Label htmlFor={variable.name}>
                    {variable.label}
                    {variable.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Label>
                  {variable.type === "textarea" ? (
                    <Textarea
                      id={variable.name}
                      placeholder={variable.placeholder}
                      value={variables[variable.name] || ""}
                      onChange={(e) =>
                        setVariables((prev) => ({
                          ...prev,
                          [variable.name]: e.target.value,
                        }))
                      }
                    />
                  ) : variable.type === "select" && variable.options ? (
                    <Select
                      value={variables[variable.name] || ""}
                      onValueChange={(value) =>
                        setVariables((prev) => ({
                          ...prev,
                          [variable.name]: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            variable.placeholder || "Select an option"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {variable.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={variable.name}
                      type={variable.type === "number" ? "number" : variable.type === "date" ? "date" : "text"}
                      placeholder={variable.placeholder}
                      value={variables[variable.name] || ""}
                      onChange={(e) =>
                        setVariables((prev) => ({
                          ...prev,
                          [variable.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!allRequiredFilled || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && generatedDoc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-primary" />
              Document Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-secondary/50 p-4">
              <div className="prose prose-sm prose-invert max-w-none">
                <div
                  className="whitespace-pre-wrap text-sm text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: generatedDoc.content }}
                />
              </div>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              {generatedDoc.disclaimer}
            </p>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Generate Another
              </Button>
              <Button asChild>
                <a
                  href={generatedDoc.download_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {generatedDoc.format.toUpperCase()}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

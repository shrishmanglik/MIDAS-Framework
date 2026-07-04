"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import type { LegalQARequest } from "@/types/legal";

interface QAInputProps {
  onSubmit: (request: LegalQARequest) => Promise<void>;
  isLoading: boolean;
}

const JURISDICTIONS = [
  { value: "federal", label: "Federal (Canada)" },
  { value: "ontario", label: "Ontario" },
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "quebec", label: "Quebec" },
  { value: "manitoba", label: "Manitoba" },
  { value: "saskatchewan", label: "Saskatchewan" },
  { value: "nova_scotia", label: "Nova Scotia" },
  { value: "new_brunswick", label: "New Brunswick" },
  { value: "newfoundland", label: "Newfoundland and Labrador" },
  { value: "pei", label: "Prince Edward Island" },
];

export function QAInput({ onSubmit, isLoading }: QAInputProps) {
  const [question, setQuestion] = useState("");
  const [jurisdiction, setJurisdiction] = useState("federal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    await onSubmit({ question: question.trim(), jurisdiction });
    setQuestion("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="jurisdiction">Jurisdiction</Label>
        <Select value={jurisdiction} onValueChange={setJurisdiction}>
          <SelectTrigger>
            <SelectValue placeholder="Select jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            {JURISDICTIONS.map((j) => (
              <SelectItem key={j.value} value={j.value}>
                {j.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="question">Your Legal Question</Label>
        <Textarea
          id="question"
          placeholder="Ask a legal question... (e.g., What are the minimum notice requirements for termination in Ontario?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!question.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Ask Question
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

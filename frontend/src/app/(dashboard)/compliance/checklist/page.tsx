"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChecklistView } from "@/components/compliance/checklist-view";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { getChecklist } from "@/lib/api/compliance";
import type { ComplianceChecklist } from "@/types/compliance";

const JURISDICTIONS = [
  { value: "federal", label: "Federal" },
  { value: "ontario", label: "Ontario" },
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "quebec", label: "Quebec" },
];

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality" },
];

export default function ComplianceChecklistPage() {
  const [jurisdiction, setJurisdiction] = useState("ontario");
  const [industry, setIndustry] = useState("technology");
  const [checklist, setChecklist] = useState<ComplianceChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      const response = await getChecklist(jurisdiction, industry);
      setChecklist(response.data);
    } catch {
      setChecklist(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Compliance Checklist
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate and track compliance checklists tailored to your jurisdiction
          and industry.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
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
        <div className="flex-1">
          <Label htmlFor="industry">Industry</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleLoad} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Load Checklist
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : checklist ? (
        <ChecklistView checklist={checklist} />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Select a jurisdiction and industry to load your compliance checklist.
          </p>
        </div>
      )}
    </div>
  );
}

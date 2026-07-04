"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EligibilityBadge } from "./eligibility-badge";
import { MapPin } from "lucide-react";
import type { Program } from "@/types/immigration";

interface PathwayCardProps {
  program: Program;
  userScore?: number;
}

export function PathwayCard({ program, userScore }: PathwayCardProps) {
  const eligibility = getEligibility(program.min_crs_score, userScore);

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {program.name}
          </CardTitle>
          <EligibilityBadge status={eligibility} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{program.province}</span>
        </div>

        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Min. CRS Score</span>
          <span className="font-semibold">{program.min_crs_score}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="rounded bg-muted px-2 py-0.5 font-medium">
            {program.program_type
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getEligibility(
  minScore: number,
  userScore?: number
): "eligible" | "partial" | "ineligible" {
  if (userScore === undefined) return "partial";
  if (userScore >= minScore) return "eligible";
  if (userScore >= minScore * 0.85) return "partial";
  return "ineligible";
}

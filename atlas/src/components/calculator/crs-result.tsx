"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatScore } from "@/lib/utils/format";
import type { CRSResult } from "@/types/immigration";
import { RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CRSResultDisplayProps {
  result: CRSResult;
  onReset: () => void;
}

function getScoreLevel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 470) {
    return {
      label: "Excellent",
      color: "text-emerald-400",
      description:
        "Your score is competitive for recent Express Entry draws.",
    };
  }
  if (score >= 400) {
    return {
      label: "Good",
      color: "text-blue-400",
      description:
        "Your score is within range. Consider improving language scores or gaining more experience.",
    };
  }
  if (score >= 300) {
    return {
      label: "Moderate",
      color: "text-amber-400",
      description:
        "You may qualify for Provincial Nominee Programs to boost your score.",
    };
  }
  return {
    label: "Needs Improvement",
    color: "text-red-400",
    description:
      "Consider improving your education, language, or work experience before applying.",
  };
}

export function CRSResultDisplay({ result, onReset }: CRSResultDisplayProps) {
  const level = getScoreLevel(result.total_score);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Your CRS Score
          </p>
          <p className="text-6xl font-bold tracking-tight text-foreground">
            {formatScore(result.total_score)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">out of 1,200</p>
          <Badge
            variant={
              result.total_score >= 470
                ? "success"
                : result.total_score >= 400
                  ? "default"
                  : result.total_score >= 300
                    ? "warning"
                    : "destructive"
            }
            className="mt-4"
          >
            {level.label}
          </Badge>
        </div>
        <CardContent className="p-5">
          <p className={`text-sm ${level.color}`}>{level.description}</p>
        </CardContent>
      </Card>

      {result.eligible_programs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Eligible Programs
            </h3>
            <ul className="space-y-2">
              {result.eligible_programs.map((program) => (
                <li
                  key={program}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {program}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Recalculate
        </Button>
        <Button size="lg" className="flex-1" asChild>
          <Link href="/pathways">
            View Pathways
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

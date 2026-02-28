"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { CRSResult } from "@/types/immigration";

interface CRSResultDisplayProps {
  result: CRSResult;
}

const MAX_SCORE = 1200;

export function CRSResultDisplay({ result }: CRSResultDisplayProps) {
  const percentage = Math.round((result.total_score / MAX_SCORE) * 100);

  const breakdownItems = [
    {
      label: "Core / Human Capital",
      score: result.breakdown.core_human_capital,
      max: 500,
    },
    {
      label: "Spouse Factors",
      score: result.breakdown.spouse_factors,
      max: 40,
    },
    {
      label: "Skill Transferability",
      score: result.breakdown.skill_transferability,
      max: 100,
    },
    {
      label: "Additional Points",
      score: result.breakdown.additional_points,
      max: 600,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          CRS Score Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8 text-center">
          <div className="mb-2 text-6xl font-bold text-primary">
            {result.total_score}
          </div>
          <p className="text-sm text-muted-foreground">
            out of {MAX_SCORE} points ({percentage}%)
          </p>
          <Progress value={percentage} className="mt-4 h-3" />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Score Breakdown</h4>
          {breakdownItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {item.score} / {item.max}
                </span>
              </div>
              <Progress
                value={item.max > 0 ? (item.score / item.max) * 100 : 0}
                className="h-2"
              />
            </div>
          ))}
        </div>

        {result.eligible_programs.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 font-semibold text-foreground">
              Eligible Programs
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.eligible_programs.map((program) => (
                <Badge key={program} variant="success">
                  {program}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          {result.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}

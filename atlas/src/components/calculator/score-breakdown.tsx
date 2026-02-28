"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScore } from "@/lib/utils/format";

interface ScoreBreakdownProps {
  breakdown: Record<string, number>;
  totalScore: number;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; maxPoints: number; color: string }
> = {
  core_human_capital: {
    label: "Core / Human Capital",
    maxPoints: 500,
    color: "bg-blue-500",
  },
  spouse_factors: {
    label: "Spouse Factors",
    maxPoints: 40,
    color: "bg-cyan-500",
  },
  skill_transferability: {
    label: "Skill Transferability",
    maxPoints: 100,
    color: "bg-indigo-500",
  },
  additional_points: {
    label: "Additional Points",
    maxPoints: 600,
    color: "bg-violet-500",
  },
};

export function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
  const categories = Object.entries(breakdown);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map(([key, score]) => {
          const config = CATEGORY_CONFIG[key] || {
            label: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            maxPoints: 600,
            color: "bg-primary",
          };
          const percentage = Math.min(
            (score / config.maxPoints) * 100,
            100
          );

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{config.label}</span>
                <span className="font-semibold">
                  {formatScore(score)}{" "}
                  <span className="text-muted-foreground font-normal">
                    / {config.maxPoints}
                  </span>
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          );
        })}

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total Score</span>
            <span className="text-xl font-bold text-primary">
              {formatScore(totalScore)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

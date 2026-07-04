"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressTrackerProps {
  completedCount: number;
  totalCount: number;
}

export function ProgressTracker({
  completedCount,
  totalCount,
}: ProgressTrackerProps) {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Settlement Progress</h3>
            <span className="text-sm font-semibold text-primary">
              {completedCount}/{totalCount}
            </span>
          </div>
          <Progress value={percentage} />
          <p className="text-xs text-muted-foreground">
            {percentage === 100
              ? "All tasks completed! You are fully settled."
              : percentage >= 50
                ? "Great progress! Keep going."
                : "Get started with your settlement tasks."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

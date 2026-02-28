"use client";

import { useState } from "react";
import useSWR from "swr";
import { ChecklistItem } from "@/components/immigration/checklist-item";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import type { PostLandingTask } from "@/types/immigration";
import type { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

export default function ChecklistPage() {
  const { data, isLoading } = useSWR<ApiResponse<PostLandingTask[]>>(
    `${API_BASE_URL}/immigration/checklist`
  );

  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const tasks = data?.data || [];
  const completionCount = tasks.filter(
    (t) => completedTasks.has(t.id) || t.completed
  ).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completionCount / tasks.length) * 100) : 0;

  const handleToggle = (id: string, completed: boolean) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (completed) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Post-Landing Checklist
        </h1>
        <p className="mt-2 text-muted-foreground">
          Essential tasks to complete after landing in Canada as a new permanent
          resident.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                Overall Progress
              </span>
            </div>
            <Badge variant={completionPercentage === 100 ? "success" : "default"}>
              {completionCount} / {tasks.length} completed
            </Badge>
          </div>
          <Progress value={completionPercentage} className="mt-3 h-3" />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryTasks = tasks.filter((t) => t.category === category);
            return (
              <div key={category}>
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryTasks.map((task) => (
                    <ChecklistItem
                      key={task.id}
                      task={{
                        ...task,
                        completed:
                          completedTasks.has(task.id) || task.completed,
                      }}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

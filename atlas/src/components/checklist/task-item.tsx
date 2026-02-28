"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PostLandingTask } from "@/types/immigration";

interface TaskItemProps {
  task: PostLandingTask;
  isCompleted: boolean;
  onToggle: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<number, string> = {
  1: "border-l-red-500",
  2: "border-l-amber-500",
  3: "border-l-blue-500",
  4: "border-l-muted-foreground",
};

export function TaskItem({ task, isCompleted, onToggle }: TaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-border border-l-4 bg-card p-4 transition-all",
        PRIORITY_COLORS[task.priority] || "border-l-muted-foreground",
        isCompleted && "opacity-60"
      )}
    >
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={isCompleted}
        onChange={() => onToggle(task.id)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-border accent-primary"
        aria-label={`Mark "${task.title}" as ${isCompleted ? "incomplete" : "complete"}`}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            "block cursor-pointer text-sm font-medium",
            isCompleted && "line-through"
          )}
        >
          {task.title}
        </label>
        <p className="text-xs text-muted-foreground">{task.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {task.category}
          </span>
          <span className="text-xs text-muted-foreground">
            Within {task.days_after_arrival} days
          </span>
        </div>
        {task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

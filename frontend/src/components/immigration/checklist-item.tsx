"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink } from "lucide-react";
import type { PostLandingTask } from "@/types/immigration";

interface ChecklistItemProps {
  task: PostLandingTask;
  onToggle: (id: string, completed: boolean) => void;
}

const priorityColors = {
  high: "danger" as const,
  medium: "warning" as const,
  low: "success" as const,
};

export function ChecklistItem({ task, onToggle }: ChecklistItemProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        task.completed
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onToggle(task.id, e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border"
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium ${
                task.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h4>
            <Badge variant={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {task.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.timeline}
            </div>
            <Badge variant="secondary" className="text-xs">
              {task.category}
            </Badge>
          </div>
          {task.resources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Resource {index + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

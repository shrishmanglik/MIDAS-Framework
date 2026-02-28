"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { TaskItem } from "@/components/checklist/task-item";
import { ProgressTracker } from "@/components/checklist/progress-tracker";
import { getChecklist } from "@/lib/api/immigration";
import type { PostLandingTask } from "@/types/immigration";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "atlas_checklist_completed";

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveCompleted(completed: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
  } catch {
    // Ignore storage errors
  }
}

export default function ChecklistPage() {
  const {
    data: tasks,
    error,
    isLoading,
  } = useSWR<PostLandingTask[]>("checklist", getChecklist);

  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      saveCompleted(next);
      return next;
    });
  }, []);

  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        const aCompleted = completed.has(a.id);
        const bCompleted = completed.has(b.id);
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return a.priority - b.priority;
      })
    : [];

  const categories = sortedTasks.reduce<Record<string, PostLandingTask[]>>(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    },
    {}
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header showBack title="Checklist" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          <div>
            <h2 className="text-xl font-bold">Settlement Checklist</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Essential tasks to complete after arriving in Canada.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading checklist...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
              Failed to load checklist. Please try again later.
            </div>
          )}

          {!isLoading && !error && tasks && (
            <>
              <ProgressTracker
                completedCount={
                  tasks.filter((t) => completed.has(t.id)).length
                }
                totalCount={tasks.length}
              />

              {Object.entries(categories).map(([category, categoryTasks]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        isCompleted={completed.has(task.id)}
                        onToggle={toggleTask}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {!isLoading && !error && tasks && tasks.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No checklist items available.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

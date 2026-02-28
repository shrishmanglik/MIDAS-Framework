"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react";
import type { ComplianceChecklist, ComplianceChecklistItem } from "@/types/compliance";

interface ChecklistViewProps {
  checklist: ComplianceChecklist;
  onToggleItem?: (itemId: string, completed: boolean) => void;
}

export function ChecklistView({ checklist, onToggleItem }: ChecklistViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = Array.from(
    new Set(checklist.items.map((item) => item.category))
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryItems = (category: string) =>
    checklist.items.filter((item) => item.category === category);

  const getCategoryCompletion = (category: string) => {
    const items = getCategoryItems(category);
    const completed = items.filter((item) => item.completed).length;
    return items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{checklist.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {checklist.jurisdiction} - {checklist.industry}
            </p>
          </div>
          <Badge variant="default">
            {checklist.completion_percentage}% Complete
          </Badge>
        </div>
        <Progress
          value={checklist.completion_percentage}
          className="mt-3 h-2"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category);
            const items = getCategoryItems(category);
            const completion = getCategoryCompletion(category);

            return (
              <div
                key={category}
                className="rounded-lg border border-border"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">
                      {category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {items.filter((i) => i.completed).length}/{items.length}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completion}%
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-2">
                    {items.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        onToggle={onToggleItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {checklist.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
}: {
  item: ComplianceChecklistItem;
  onToggle?: (id: string, completed: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        onClick={() => onToggle?.(item.id, !item.completed)}
        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
        aria-label={`Toggle ${item.title}`}
      >
        {item.completed ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              item.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {item.title}
          </span>
          {item.required && (
            <Badge variant="danger" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.description}
        </p>
        {item.notes && (
          <p className="mt-1 text-xs italic text-muted-foreground">
            Note: {item.notes}
          </p>
        )}
      </div>
    </div>
  );
}

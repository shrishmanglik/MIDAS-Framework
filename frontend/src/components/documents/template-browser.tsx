"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowRight } from "lucide-react";
import type { Template } from "@/types/documents";
import type { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

interface TemplateBrowserProps {
  onSelectTemplate: (template: Template) => void;
}

export function TemplateBrowser({ onSelectTemplate }: TemplateBrowserProps) {
  const { data, isLoading } = useSWR<ApiResponse<Template[]>>(
    `${API_BASE_URL}/documents/templates`
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const templates = data?.data || [];

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          No templates available
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Document templates will appear here once configured.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer transition-colors hover:border-primary/50"
          onClick={() => onSelectTemplate(template)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{template.name}</CardTitle>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {template.variables.length} variable
                {template.variables.length !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm">
                Use Template
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

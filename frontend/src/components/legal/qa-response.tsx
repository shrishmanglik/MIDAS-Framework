"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, ExternalLink, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { LegalQAResponse } from "@/types/legal";

interface QAResponseProps {
  response: LegalQAResponse | null;
  isLoading: boolean;
}

export function QAResponse({ response, isLoading }: QAResponseProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          Ask a Legal Question
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your question above and select a jurisdiction to get AI-powered
          legal research.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" />
            Legal Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{response.jurisdiction}</Badge>
            {response.category && (
              <Badge variant="outline">{response.category}</Badge>
            )}
          </div>
        </div>
        <div className="mt-2 rounded-md bg-secondary/50 p-3">
          <p className="text-sm font-medium text-muted-foreground">Question</p>
          <p className="mt-1 text-sm text-foreground">{response.question}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {response.answer}
          </div>
        </div>

        {response.confidence > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <div className="h-2 w-24 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${response.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(response.confidence * 100)}%
            </span>
          </div>
        )}

        {response.sources.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Sources & References
            </h4>
            <div className="space-y-2">
              {response.sources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-md border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {source.title}
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {source.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(response.created_at)}</span>
        </div>

        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs text-primary/80">{response.disclaimer}</p>
        </div>
      </CardContent>
    </Card>
  );
}

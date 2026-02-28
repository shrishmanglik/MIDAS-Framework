"use client";

import { useState } from "react";
import { QAInput } from "@/components/legal/qa-input";
import { QAResponse } from "@/components/legal/qa-response";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { askQuestion } from "@/lib/api/legal";
import type { LegalQARequest, LegalQAResponse } from "@/types/legal";

export default function LegalQAPage() {
  const [response, setResponse] = useState<LegalQAResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<LegalQAResponse[]>([]);

  const handleSubmit = async (request: LegalQARequest) => {
    setIsLoading(true);
    try {
      const result = await askQuestion(request);
      setResponse(result.data);
      setHistory((prev) => [result.data, ...prev]);
    } catch {
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Legal Q&A
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ask legal questions and receive AI-researched answers with source
          references.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <QAInput onSubmit={handleSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>

          {history.length > 1 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Recent Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.slice(1, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setResponse(item)}
                      className="block w-full rounded-md p-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <p className="line-clamp-2">{item.question}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <QAResponse response={response} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

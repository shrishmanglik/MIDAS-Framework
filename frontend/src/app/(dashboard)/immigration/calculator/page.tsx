"use client";

import { useState } from "react";
import { CRSForm } from "@/components/immigration/crs-form";
import { CRSResultDisplay } from "@/components/immigration/crs-result";
import { useCRSCalculator } from "@/lib/hooks/use-crs-calculator";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CalculatorPage() {
  const { result, reset } = useCRSCalculator();
  const [showResult, setShowResult] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          CRS Score Calculator
        </h1>
        <p className="mt-2 text-muted-foreground">
          Calculate your Comprehensive Ranking System score for Express Entry
          immigration to Canada.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CRSForm onResult={() => setShowResult(true)} />

        {showResult && result ? (
          <div className="space-y-4">
            <CRSResultDisplay result={result} />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setShowResult(false);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Recalculate
              </Button>
              <Button asChild>
                <Link href="/immigration/pathways">
                  View Pathways
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden items-center justify-center rounded-lg border border-dashed border-border p-12 lg:flex">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Your CRS score will appear here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete the form and click Calculate to see your results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

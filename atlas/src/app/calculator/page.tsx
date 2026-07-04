"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { CRSForm } from "@/components/calculator/crs-form";
import { CRSResultDisplay } from "@/components/calculator/crs-result";
import { ScoreBreakdown } from "@/components/calculator/score-breakdown";
import { useCRSCalculator } from "@/lib/hooks/use-crs-calculator";

export default function CalculatorPage() {
  const calculator = useCRSCalculator();

  return (
    <div className="flex min-h-screen flex-col">
      <Header showBack title="CRS Calculator" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-lg">
          {calculator.result ? (
            <div className="space-y-6">
              <CRSResultDisplay
                result={calculator.result}
                onReset={calculator.reset}
              />
              <ScoreBreakdown
                breakdown={calculator.result.breakdown}
                totalScore={calculator.result.total_score}
              />
            </div>
          ) : (
            <CRSForm
              step={calculator.step}
              totalSteps={calculator.totalSteps}
              input={calculator.input}
              isCalculating={calculator.isCalculating}
              error={calculator.error}
              onUpdateInput={calculator.updateInput}
              onNextStep={calculator.nextStep}
              onPrevStep={calculator.prevStep}
              onSubmit={calculator.submit}
            />
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

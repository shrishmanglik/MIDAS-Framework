import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/contracts/risk-badge";
import { FileText } from "lucide-react";
import type { Clause } from "@/types/contracts";

interface ClauseCardProps {
  clause: Clause;
}

export function ClauseCard({ clause }: ClauseCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{clause.title}</h4>
                <RiskBadge level={clause.risk_level} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {clause.description}
              </p>
              <div className="mt-3 rounded-md bg-secondary/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Original Text
                </p>
                <p className="mt-1 text-sm italic text-foreground/80">
                  &ldquo;{clause.original_text}&rdquo;
                </p>
              </div>
              {clause.recommendation && (
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">
                    Recommendation
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {clause.recommendation}
                  </p>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Type: {clause.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Section: {clause.section}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

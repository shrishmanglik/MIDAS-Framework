"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ClauseCard } from "@/components/contracts/clause-card";
import { RiskBadge } from "@/components/contracts/risk-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { ContractReview } from "@/types/contracts";
import type { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

export default function ContractReviewPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useSWR<ApiResponse<ContractReview>>(
    `${API_BASE_URL}/contracts/reviews/${id}`
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const review = data?.data;

  if (!review) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          Review not found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The requested contract review could not be found.
        </p>
      </div>
    );
  }

  const highRiskClauses = review.clauses.filter(
    (c) => c.risk_level === "high" || c.risk_level === "critical"
  );
  const mediumRiskClauses = review.clauses.filter(
    (c) => c.risk_level === "medium"
  );
  const lowRiskClauses = review.clauses.filter((c) => c.risk_level === "low");

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">
            {review.filename}
          </h1>
          <RiskBadge level={review.overall_risk} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Uploaded {formatDate(review.uploaded_at)}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {review.total_clauses}
            </p>
            <p className="text-xs text-muted-foreground">Total Clauses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {review.high_risk_count}
            </p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {review.medium_risk_count}
            </p>
            <p className="text-xs text-muted-foreground">Medium Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {review.low_risk_count}
            </p>
            <p className="text-xs text-muted-foreground">Low Risk</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80">{review.summary}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Clauses ({review.clauses.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High Risk ({highRiskClauses.length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium Risk ({mediumRiskClauses.length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low Risk ({lowRiskClauses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {review.clauses.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} />
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {highRiskClauses.length > 0 ? (
            highRiskClauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No high-risk clauses found.
            </p>
          )}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {mediumRiskClauses.length > 0 ? (
            mediumRiskClauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No medium-risk clauses found.
            </p>
          )}
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {lowRiskClauses.length > 0 ? (
            lowRiskClauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No low-risk clauses found.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-xs text-muted-foreground">
        {review.disclaimer}
      </p>
    </div>
  );
}

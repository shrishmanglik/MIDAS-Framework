"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/contracts/risk-badge";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { ContractReview } from "@/types/contracts";
import type { PaginatedResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

export default function ContractsPage() {
  const { data, isLoading } = useSWR<PaginatedResponse<ContractReview>>(
    `${API_BASE_URL}/contracts/reviews?page=1&per_page=10`
  );

  const reviews = data?.data || [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contract Review
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload contracts for AI-powered analysis and risk assessment.
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Contract
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
              No contracts reviewed yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a PDF or DOCX contract to get started.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/contracts/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Contract
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="transition-colors hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {review.filename}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {review.summary}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <RiskBadge level={review.overall_risk} />
                        <span className="text-xs text-muted-foreground">
                          {review.total_clauses} clauses analyzed
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.uploaded_at)}
                        </span>
                        <Badge
                          variant={
                            review.status === "completed"
                              ? "success"
                              : review.status === "failed"
                                ? "danger"
                                : "secondary"
                          }
                        >
                          {review.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/contracts/${review.id}`}>
                      View
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

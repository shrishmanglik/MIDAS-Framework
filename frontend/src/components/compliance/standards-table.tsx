"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink } from "lucide-react";
import type { EmploymentStandard } from "@/types/compliance";
import type { ApiResponse } from "@/types/api";
import { formatDate } from "@/lib/utils/format";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api/v1";

export function StandardsTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSWR<ApiResponse<EmploymentStandard[]>>(
    `${API_BASE_URL}/compliance/standards`
  );

  const standards = data?.data || [];
  const filtered = standards.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.jurisdiction.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Standards</CardTitle>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search standards by title, jurisdiction, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {search
              ? "No standards match your search criteria."
              : "No employment standards available."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">
                    Jurisdiction
                  </th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">
                    Updated
                  </th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((standard) => (
                  <tr key={standard.id} className="group">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">
                        {standard.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {standard.description}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">
                        {standard.jurisdiction}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline">{standard.category}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {formatDate(standard.last_updated)}
                    </td>
                    <td className="py-3">
                      <a
                        href={standard.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

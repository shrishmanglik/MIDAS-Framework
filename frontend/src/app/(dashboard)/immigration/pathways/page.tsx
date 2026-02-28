"use client";

import useSWR from "swr";
import { PathwayCard } from "@/components/immigration/pathway-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { matchPathways } from "@/lib/api/immigration";
import { Search, Loader2 } from "lucide-react";
import type { Program } from "@/types/immigration";
import type { ApiResponse } from "@/types/api";

export default function PathwaysPage() {
  const [score, setScore] = useState<number>(450);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await matchPathways(score);
      setPrograms(response.data);
      setHasSearched(true);
    } catch {
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Immigration Pathways
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find eligible immigration programs based on your CRS score.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <Label htmlFor="score">Your CRS Score</Label>
          <Input
            id="score"
            type="number"
            min={0}
            max={1200}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            placeholder="Enter your CRS score"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Pathways
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-6">
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : hasSearched && programs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium text-foreground">
            No pathways found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your CRS score to see available programs.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program) => (
            <PathwayCard
              key={program.id}
              program={program}
              userScore={score}
            />
          ))}
        </div>
      )}
    </div>
  );
}

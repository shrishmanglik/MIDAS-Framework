"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { PathwayCard } from "@/components/pathways/pathway-card";
import { Input } from "@/components/ui/input";
import { getPrograms } from "@/lib/api/immigration";
import type { Program } from "@/types/immigration";
import { Search, Loader2 } from "lucide-react";

export default function PathwaysPage() {
  const {
    data: programs,
    error,
    isLoading,
  } = useSWR<Program[]>("programs", getPrograms);

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Program[]>([]);

  useEffect(() => {
    if (!programs) {
      setFiltered([]);
      return;
    }

    if (!search.trim()) {
      setFiltered(programs);
      return;
    }

    const query = search.toLowerCase();
    setFiltered(
      programs.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.province.toLowerCase().includes(query) ||
          p.program_type.toLowerCase().includes(query)
      )
    );
  }, [programs, search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header showBack title="Pathways" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          <div>
            <h2 className="text-xl font-bold">Immigration Pathways</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore federal and provincial immigration programs available to
              you.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading programs...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
              Failed to load programs. Please try again later.
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No programs match your search."
                  : "No programs available."}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((program) => (
              <PathwayCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

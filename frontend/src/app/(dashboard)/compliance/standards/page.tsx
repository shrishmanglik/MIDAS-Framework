"use client";

import { StandardsTable } from "@/components/compliance/standards-table";

export default function StandardsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Employment Standards
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search employment standards across Canadian federal and
          provincial jurisdictions.
        </p>
      </div>

      <StandardsTable />

      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-primary/80">
          <span className="font-semibold">Disclaimer:</span> Employment
          standards information is provided for reference only. Standards may
          change without notice. Always verify with official government sources
          and consult a licensed attorney for legal advice.
        </p>
      </div>
    </div>
  );
}

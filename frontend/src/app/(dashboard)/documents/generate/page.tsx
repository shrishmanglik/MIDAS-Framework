"use client";

import { GenerationWizard } from "@/components/documents/generation-wizard";

export default function GenerateDocumentPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Generate Document
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select a template, fill in your details, and generate a customized
          legal document.
        </p>
      </div>

      <GenerationWizard />

      <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-primary/80">
          <span className="font-semibold">Disclaimer:</span> Generated documents
          are templates for informational purposes only. All legal documents
          should be reviewed by a qualified attorney before use. Not legal
          advice.
        </p>
      </div>
    </div>
  );
}

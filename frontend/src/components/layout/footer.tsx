import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              LegalAI Studio
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Not legal advice. This platform provides legal information for
            educational purposes only. Consult a licensed attorney for advice
            specific to your situation.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="border-b border-primary/30 bg-primary/5 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-primary/80">
          <span className="font-semibold text-primary">Legal Disclaimer:</span>{" "}
          This platform provides legal information, not legal advice. All
          outputs are for informational and educational purposes only. Always
          consult a licensed attorney for advice specific to your situation.
        </p>
      </div>
    </div>
  );
}

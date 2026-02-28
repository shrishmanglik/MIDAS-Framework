export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg space-y-3 text-center">
        <p className="text-xs text-muted-foreground">
          ATLAS - Immigration Pathways
        </p>
        <p className="text-xs text-muted-foreground/70">
          Not legal advice. This tool provides general information about
          Canadian immigration programs. Consult a licensed immigration
          consultant or attorney for advice specific to your situation.
        </p>
        <p className="text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} MIDAS Framework. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

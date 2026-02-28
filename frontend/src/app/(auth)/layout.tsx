import { Scale } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Scale className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-primary">LegalAI Studio</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 max-w-sm text-center text-xs text-muted-foreground">
        This platform provides legal information, not legal advice. Consult a
        licensed attorney for advice specific to your situation.
      </p>
    </div>
  );
}

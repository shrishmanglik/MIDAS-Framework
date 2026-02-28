import Link from "next/link";
import { Scale, ArrowRight, Shield, FileText, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Scale className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Legal<span className="text-primary">AI</span> Studio
          </h1>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">
          Legal Intelligence Platform
        </h2>

        <p className="mb-8 text-lg text-muted-foreground">
          AI-powered legal tools for immigration assessment, contract review,
          document generation, compliance tracking, and legal research. Built for
          professionals who need accurate, efficient legal intelligence.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <Globe className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h3 className="font-semibold text-card-foreground">Immigration</h3>
            <p className="text-sm text-muted-foreground">
              CRS calculator and pathway matching
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <FileText className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h3 className="font-semibold text-card-foreground">Contracts</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered contract review and analysis
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <Shield className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h3 className="font-semibold text-card-foreground">Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Employment standards and checklists
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-8 py-3 text-lg font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Create Account
          </Link>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          This platform provides legal information, not legal advice. Consult a
          licensed attorney for legal advice specific to your situation.
        </p>
      </div>
    </div>
  );
}

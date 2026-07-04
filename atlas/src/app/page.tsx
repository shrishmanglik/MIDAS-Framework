import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Compass, ClipboardCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden px-4 pb-12 pt-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="relative mx-auto max-w-lg text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-primary">ATLAS</span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Immigration Pathways
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Calculate your Comprehensive Ranking System (CRS) score, discover
              eligible immigration programs, and plan your settlement in Canada.
            </p>
            <Button size="xl" className="mt-8 w-full sm:w-auto" asChild>
              <Link href="/calculator">
                Calculate Your CRS Score
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-lg space-y-4">
            <FeatureCard
              icon={<Calculator className="h-6 w-6 text-primary" />}
              title="CRS Calculator"
              description="Get an estimate of your Comprehensive Ranking System score based on your profile."
              href="/calculator"
            />
            <FeatureCard
              icon={<Compass className="h-6 w-6 text-primary" />}
              title="Pathway Matching"
              description="Discover which federal and provincial immigration programs match your profile."
              href="/pathways"
            />
            <FeatureCard
              icon={<ClipboardCheck className="h-6 w-6 text-primary" />}
              title="Settlement Checklist"
              description="Track essential post-landing tasks to help you settle in Canada."
              href="/checklist"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6">
        <p className="text-center text-xs text-muted-foreground/70">
          Not legal advice. This tool provides general information about
          Canadian immigration programs. Consult a licensed immigration
          consultant or attorney for advice specific to your situation.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:border-primary/30 hover:bg-card/80 active:scale-[0.98]">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="rounded-lg bg-primary/10 p-2.5">{icon}</div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

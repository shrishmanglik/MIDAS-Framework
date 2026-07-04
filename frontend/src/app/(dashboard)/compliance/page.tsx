import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckSquare, ArrowRight } from "lucide-react";

const tools = [
  {
    title: "Employment Standards",
    description:
      "Browse and search employment standards across Canadian jurisdictions. Stay up to date with minimum wage, overtime, vacation, and termination requirements.",
    icon: BookOpen,
    href: "/compliance/standards",
  },
  {
    title: "Compliance Checklist",
    description:
      "Track your compliance with employment laws using interactive checklists tailored to your jurisdiction and industry.",
    icon: CheckSquare,
    href: "/compliance/checklist",
  },
];

export default function CompliancePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Compliance Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          Stay compliant with employment standards and regulations across
          Canadian jurisdictions.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.title}
              className="transition-colors hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={tool.href}>
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-primary/80">
          <span className="font-semibold">Disclaimer:</span> Compliance
          information is provided for reference only and may not reflect the most
          recent legislative changes. Always verify with official government
          sources and consult a licensed attorney.
        </p>
      </div>
    </div>
  );
}

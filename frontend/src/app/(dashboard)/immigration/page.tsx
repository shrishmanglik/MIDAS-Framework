import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Compass, CheckSquare, ArrowRight } from "lucide-react";

const tools = [
  {
    title: "CRS Calculator",
    description:
      "Calculate your Comprehensive Ranking System score based on age, education, language proficiency, work experience, and additional factors.",
    icon: Calculator,
    href: "/immigration/calculator",
  },
  {
    title: "Immigration Pathways",
    description:
      "Discover eligible immigration programs based on your CRS score and profile, including Express Entry and Provincial Nominee Programs.",
    icon: Compass,
    href: "/immigration/pathways",
  },
  {
    title: "Post-Landing Checklist",
    description:
      "Access a comprehensive checklist of tasks to complete after landing in Canada, from SIN application to healthcare registration.",
    icon: CheckSquare,
    href: "/immigration/checklist",
  },
];

export default function ImmigrationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Immigration Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive tools for Canadian immigration assessment and planning.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  FileText,
  FileCheck,
  Shield,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "Immigration",
    description:
      "Calculate your CRS score, explore immigration pathways, and access post-landing checklists for Canada.",
    icon: Globe,
    href: "/immigration",
    features: ["CRS Calculator", "Pathway Matching", "Post-Landing Checklist"],
  },
  {
    title: "Contract Review",
    description:
      "Upload contracts for AI-powered clause analysis, risk assessment, and actionable recommendations.",
    icon: FileText,
    href: "/contracts",
    features: ["Clause Analysis", "Risk Scoring", "Recommendations"],
  },
  {
    title: "Document Generation",
    description:
      "Generate legal documents from templates with customizable variables and instant preview.",
    icon: FileCheck,
    href: "/documents",
    features: ["Template Library", "Variable Filling", "PDF Export"],
  },
  {
    title: "Compliance",
    description:
      "Stay compliant with employment standards across Canadian jurisdictions with tracked checklists.",
    icon: Shield,
    href: "/compliance",
    features: ["Standards Database", "Compliance Checklists", "Jurisdiction Search"],
  },
  {
    title: "Legal Q&A",
    description:
      "Ask legal questions and receive AI-researched answers with source references and jurisdiction context.",
    icon: MessageSquare,
    href: "/legal-qa",
    features: ["AI Research", "Source Citations", "Jurisdiction Filtering"],
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Access all legal intelligence tools from one place.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.title}
              className="group transition-colors hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 space-y-1">
                  {module.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full group-hover:border-primary group-hover:text-primary"
                  asChild
                >
                  <Link href={module.href}>
                    Open Module
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

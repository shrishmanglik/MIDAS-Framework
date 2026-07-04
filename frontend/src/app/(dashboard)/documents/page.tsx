import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Plus, ArrowRight } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Document Generation
          </h1>
          <p className="mt-2 text-muted-foreground">
            Generate legal documents from professionally drafted templates.
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/generate">
            <Plus className="mr-2 h-4 w-4" />
            Generate Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-colors hover:border-primary/50">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mt-4 text-lg">
              Generate from Template
            </CardTitle>
            <CardDescription>
              Browse available templates, fill in your details, and generate
              customized legal documents ready for download.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/documents/generate">
                Start Generating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

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

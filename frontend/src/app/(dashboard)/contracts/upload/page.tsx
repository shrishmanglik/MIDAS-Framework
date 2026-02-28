"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/contracts/upload-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle } from "lucide-react";
import type { ContractReview } from "@/types/contracts";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = (review: ContractReview) => {
    router.push(`/contracts/${review.id}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Upload Contract</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a PDF or DOCX contract for AI-powered review and analysis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contract Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadDropzone onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Secure Processing
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your documents are encrypted during upload and processing.
                    Files are not stored permanently.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Supported Formats
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF and DOCX files up to 10MB. Scanned documents with OCR
                    support coming soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Important Notice
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI analysis is for informational purposes only. Always have
                    contracts reviewed by a qualified legal professional before
                    signing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

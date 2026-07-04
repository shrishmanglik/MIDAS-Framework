import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  EmploymentStandard,
  ComplianceChecklist,
} from "@/types/compliance";

export async function getStandards(
  jurisdiction?: string
): Promise<ApiResponse<EmploymentStandard[]>> {
  const params: Record<string, string> = {};
  if (jurisdiction) {
    params.jurisdiction = jurisdiction;
  }
  return apiClient.get<ApiResponse<EmploymentStandard[]>>(
    "/compliance/standards",
    params
  );
}

export async function getChecklist(
  jurisdiction: string,
  industry?: string
): Promise<ApiResponse<ComplianceChecklist>> {
  const params: Record<string, string> = { jurisdiction };
  if (industry) {
    params.industry = industry;
  }
  return apiClient.get<ApiResponse<ComplianceChecklist>>(
    "/compliance/checklist",
    params
  );
}

import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  Template,
  DocumentGenerateRequest,
  GeneratedDocument,
} from "@/types/documents";

export async function listTemplates(): Promise<ApiResponse<Template[]>> {
  return apiClient.get<ApiResponse<Template[]>>("/documents/templates");
}

export async function getTemplate(id: string): Promise<ApiResponse<Template>> {
  return apiClient.get<ApiResponse<Template>>(`/documents/templates/${id}`);
}

export async function generateDocument(
  request: DocumentGenerateRequest
): Promise<ApiResponse<GeneratedDocument>> {
  return apiClient.post<ApiResponse<GeneratedDocument>>(
    "/documents/generate",
    request
  );
}

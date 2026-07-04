import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  LegalQARequest,
  LegalQAResponse,
  LegalQAHistoryItem,
} from "@/types/legal";

export async function askQuestion(
  request: LegalQARequest
): Promise<ApiResponse<LegalQAResponse>> {
  return apiClient.post<ApiResponse<LegalQAResponse>>("/legal/ask", request);
}

export async function getHistory(
  page = 1,
  perPage = 20
): Promise<PaginatedResponse<LegalQAHistoryItem>> {
  return apiClient.get<PaginatedResponse<LegalQAHistoryItem>>(
    "/legal/history",
    {
      page: page.toString(),
      per_page: perPage.toString(),
    }
  );
}

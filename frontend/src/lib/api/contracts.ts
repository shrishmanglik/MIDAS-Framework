import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ContractReview, Clause } from "@/types/contracts";

export async function uploadContract(
  file: File
): Promise<ApiResponse<ContractReview>> {
  return apiClient.upload<ApiResponse<ContractReview>>(
    "/contracts/upload",
    file
  );
}

export async function getReview(
  id: string
): Promise<ApiResponse<ContractReview>> {
  return apiClient.get<ApiResponse<ContractReview>>(`/contracts/reviews/${id}`);
}

export async function listReviews(
  page = 1,
  perPage = 10
): Promise<PaginatedResponse<ContractReview>> {
  return apiClient.get<PaginatedResponse<ContractReview>>(
    "/contracts/reviews",
    {
      page: page.toString(),
      per_page: perPage.toString(),
    }
  );
}

export async function getClauses(
  reviewId: string
): Promise<ApiResponse<Clause[]>> {
  return apiClient.get<ApiResponse<Clause[]>>(
    `/contracts/reviews/${reviewId}/clauses`
  );
}

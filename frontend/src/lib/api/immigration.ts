import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  CRSInput,
  CRSResult,
  Program,
  PostLandingTask,
  DrawResult,
} from "@/types/immigration";

export async function calculateCRS(
  input: CRSInput
): Promise<ApiResponse<CRSResult>> {
  return apiClient.post<ApiResponse<CRSResult>>("/immigration/crs/calculate", input);
}

export async function matchPathways(
  score: number
): Promise<ApiResponse<Program[]>> {
  return apiClient.get<ApiResponse<Program[]>>("/immigration/pathways", {
    score: score.toString(),
  });
}

export async function getChecklist(): Promise<ApiResponse<PostLandingTask[]>> {
  return apiClient.get<ApiResponse<PostLandingTask[]>>(
    "/immigration/checklist"
  );
}

export async function getDraws(): Promise<ApiResponse<DrawResult[]>> {
  return apiClient.get<ApiResponse<DrawResult[]>>("/immigration/draws");
}

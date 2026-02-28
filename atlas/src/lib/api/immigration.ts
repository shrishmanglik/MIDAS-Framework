import { apiClient } from "./client";
import type {
  CRSInput,
  CRSResult,
  Program,
  PostLandingTask,
} from "@/types/immigration";

export async function calculateCRS(input: CRSInput): Promise<CRSResult> {
  return apiClient.post<CRSResult>("/immigration/crs/calculate", input);
}

export async function getPrograms(): Promise<Program[]> {
  return apiClient.get<Program[]>("/immigration/programs");
}

export async function matchPathways(input: CRSInput): Promise<Program[]> {
  return apiClient.post<Program[]>("/immigration/pathways/match", input);
}

export async function getChecklist(): Promise<PostLandingTask[]> {
  return apiClient.get<PostLandingTask[]>("/immigration/checklist");
}

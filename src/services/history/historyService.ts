import { apiGet } from "@/services/api/client";
import type { HistoryResponse } from "@/types/prediction";

export async function getPredictionHistory(): Promise<HistoryResponse> {
  return apiGet<HistoryResponse>("/api/history");
}

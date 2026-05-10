import { apiPost } from "@/services/api/client";
import type { BandGapPrediction, PredictionResponse } from "@/types/prediction";

export async function predictBandGap(text: string): Promise<BandGapPrediction> {
  const payload = await apiPost<PredictionResponse, { model: "bandgap"; input: string }>(
    "/api/predict",
    {
      model: "bandgap",
      input: text,
    },
  );

  return {
    prediction: payload.output.band_gap_ev,
    unit: "eV",
    id: payload.predictionId,
    confidence: payload.output.confidence,
    model: "bandgap",
    properties: payload.output.properties,
  };
}

export type BatchPredictionItem = {
  index: number;
  prediction?: number;
  error?: string;
};

export async function batchPredictBandGap(texts: string[]): Promise<BatchPredictionItem[]> {
  const settled = await Promise.allSettled(texts.map((text) => predictBandGap(text)));

  return settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        index,
        prediction: result.value.prediction,
      };
    }

    return {
      index,
      error: result.reason instanceof Error ? result.reason.message : "Prediction failed.",
    };
  });
}

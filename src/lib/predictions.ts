import type { PredictionOutput } from "./supabase";

export async function runPrediction(inputText: string): Promise<PredictionOutput> {
  const normalizedLength = Math.min(inputText.trim().length / 500, 1);
  const bandGapEv = Number((0.7 + normalizedLength * 3.1).toFixed(3));

  return {
    label: bandGapEv >= 2.5 ? "wide-gap semiconductor" : "narrow-gap semiconductor",
    band_gap_ev: bandGapEv,
    confidence: 0.82,
    source: "mock",
  };
}

export type ModelName = "bandgap" | "density" | "conductivity" | "stability";

export type PredictionOutput = {
  label: string;
  band_gap_ev: number;
  confidence: number;
  source: "fastapi";
};

export type PredictionResponse = {
  output: PredictionOutput;
  predictionId?: string | null;
};

export type BandGapPrediction = {
  prediction: number;
  unit: string;
  id?: string | null;
  confidence?: number;
  model?: ModelName;
};

export type HistoryItem = {
  id: string;
  input_text: string;
  output: {
    label?: string;
    band_gap_ev: number;
    confidence?: number;
    source?: string;
  };
  created_at: string;
  shared_count?: number;
};

export type HistoryResponse = {
  history: HistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

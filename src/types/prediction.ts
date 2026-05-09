export type ModelName = "bandgap" | "density" | "conductivity" | "stability";

export type PredictionOutput = {
  label: string;
  band_gap_ev: number;
  confidence: number;
  source: "fastapi";
};

export type PredictionResponse = {
  output: PredictionOutput;
};

export type BandGapPrediction = {
  prediction: number;
  unit: string;
};

export type HistoryItem = {
  id: string;
  input_text: string;
  output: {
    band_gap_ev: number;
  };
  created_at: string;
};

export type HistoryResponse = {
  history: HistoryItem[];
};

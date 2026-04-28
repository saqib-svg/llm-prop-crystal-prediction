export type BandGapPredictionResponse = {
  prediction: number;
  unit: string;
};

const API_BASE_URL = (import.meta.env.VITE_BANDGAP_API_BASE_URL ?? '').replace(/\/$/, '');
const API_PREFIX = API_BASE_URL || '';

export async function predictBandGap(text: string): Promise<BandGapPredictionResponse> {
  const response = await fetch(`${API_PREFIX}/predict-bandgap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    let detail = 'Prediction request failed.';
    try {
      const errorBody: unknown = await response.json();
      if (errorBody && typeof errorBody === 'object' && 'detail' in errorBody) {
        const maybeDetail = (errorBody as { detail?: unknown }).detail;
        if (typeof maybeDetail === 'string') {
          detail = maybeDetail;
        }
      }
    } catch {
      // Fall through to the generic error message.
    }

    throw new Error(detail || `Prediction request failed with status ${response.status}.`);
  }

  return response.json() as Promise<BandGapPredictionResponse>;
}

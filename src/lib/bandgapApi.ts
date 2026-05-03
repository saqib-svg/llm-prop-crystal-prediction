export type BandGapPredictionResponse = {
  prediction: number;
  unit: string;
};

export async function predictBandGap(text: string): Promise<BandGapPredictionResponse> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input_text: text }),
  });

  if (!response.ok) {
    let detail = 'Prediction request failed.';
    try {
      const errorBody: unknown = await response.json();
      if (errorBody && typeof errorBody === 'object') {
        if ('error' in errorBody && typeof errorBody.error === 'string') {
          detail = errorBody.error;
        } else if ('detail' in errorBody && typeof errorBody.detail === 'string') {
          detail = errorBody.detail;
        }
      }
    } catch {
      // Fall through to the generic error message.
    }

    throw new Error(detail || `Prediction request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  if (
    payload &&
    typeof payload === 'object' &&
    'output' in payload &&
    payload.output &&
    typeof payload.output === 'object' &&
    'band_gap_ev' in payload.output &&
    typeof payload.output.band_gap_ev === 'number'
  ) {
    return {
      prediction: payload.output.band_gap_ev,
      unit: 'eV',
    };
  }

  throw new Error('Prediction response was missing output.band_gap_ev.');
}

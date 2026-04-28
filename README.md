# Band Gap Predictor

Predict the **band gap (eV)** of crystalline materials from plain-text descriptions using a fine-tuned **DistilRoBERTa-base** Transformer regression model.

- **Best Validation MAE:** 0.3411 eV
- **Training data:** ~124k material descriptions (LLM-Prop dataset)
- **Stack:** PyTorch + Hugging Face Transformers · FastAPI · React + Vite + Tailwind

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | ≥ 3.10 |
| Node.js | ≥ 18 |
| pip | ≥ 23 |

Ensure model files exist at their expected paths (already included):

```
models/
  best_bandgap_model.pt   ← trained PyTorch weights (~314 MB)
  tokenizer/              ← saved DistilRoBERTa tokenizer
```

---

## 1 — Start the FastAPI Backend

```powershell
# From the project root
cd "Deep Learning Band Gap Predictor"

# (First time) create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Run the API server
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Test the backend is live:

```powershell
curl http://127.0.0.1:8000/health
# → {"status":"ok","model_ready":true,"device":"cpu"}
```

Test a prediction:

```powershell
curl -X POST http://127.0.0.1:8000/predict-bandgap `
  -H "Content-Type: application/json" `
  -d '{"text": "Silicon crystallizes in diamond cubic structure and is an indirect semiconductor."}'
# → {"prediction": 1.12xx, "unit": "eV"}
```

---

## 2 — Start the React Frontend

Open a **second terminal** (keep the backend running):

```powershell
# Install npm dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

> The Vite dev server proxies `/predict-bandgap`, `/batch-predict`, and `/health`
> requests to `http://127.0.0.1:8000` automatically — no CORS configuration needed.

---

## API Reference

### `GET /health`
Returns model status.
```json
{ "status": "ok", "model_ready": true, "device": "cpu" }
```

### `POST /predict-bandgap`
Single-text inference.

**Request:**
```json
{ "text": "ZnO crystallizes in the hexagonal P6_3mc space group..." }
```
**Response:**
```json
{ "prediction": 3.3471, "unit": "eV" }
```

### `POST /batch-predict`
Batch inference (up to 100 texts per request).

**Request:**
```json
{ "texts": ["Si description...", "GaAs description..."] }
```
**Response:**
```json
{
  "results": [
    { "index": 0, "text": "...", "prediction": 1.1234, "unit": "eV", "error": null },
    { "index": 1, "text": "...", "prediction": 1.4210, "unit": "eV", "error": null }
  ],
  "total": 2,
  "succeeded": 2,
  "failed": 0
}
```

---

## Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | `models/best_bandgap_model.pt` | Path to model weights |
| `TOKENIZER_DIR` | `models/tokenizer` | Path to tokenizer directory |
| `MODEL_DEVICE` | auto (cuda/cpu) | Force a specific device |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins |
| `VITE_BANDGAP_API_BASE_URL` | *(empty = use proxy)* | Frontend API base URL |

---

## Model Architecture

```
Input Text
  → DistilRoBERTa-base Tokenizer (max 256 tokens)
  → DistilRoBERTa Encoder (6 layers, hidden_size=768)
  → Mean Pooling over token embeddings
  → Dropout(0.1)
  → Linear(768 → 256) + ReLU
  → Dropout(0.1)
  → Linear(256 → 1)
  → Predicted Band Gap (float, in eV)
```

**Training:** AdamW · LR 2e-5 → 1e-5 · Cosine warmup · L1 Loss · Batch size 8
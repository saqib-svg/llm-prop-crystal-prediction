# Band Gap Predictor

Predict the band gap (eV) of crystalline materials from plain-text descriptions using a fine-tuned DistilRoBERTa-base Transformer regression model.

- Best validation MAE: 0.3411 eV
- Training data: about 124k material descriptions from the LLM-Prop dataset
- Stack: PyTorch, Hugging Face Transformers, FastAPI, Next.js, NextAuth.js, Tailwind CSS

## Project Structure

```text
.
|-- data/                 Dataset CSV files
|-- inference/            Prediction notebook
|-- models/               Trained model and tokenizer files
|-- preprocessing/        Data conversion helpers
|-- server/               FastAPI backend
|-- src/app/              Next.js App Router frontend
|   |-- api/auth/         NextAuth.js Google auth route
|   |-- layout.tsx        Root layout with session provider
|   |-- page.tsx          Homepage
|   `-- providers.tsx     NextAuth SessionProvider
|-- training/             Model training script
|-- requirements.txt      Python backend dependencies
|-- package.json          Node/Next.js dependencies and scripts
`-- start-app.bat         Windows one-click launcher
```

## Quick Start on Windows

Double-click:

```text
start-app.bat
```

The script creates `.venv`, installs Python dependencies from `requirements.txt`, installs npm dependencies when needed, starts the FastAPI backend on `http://127.0.0.1:8000`, starts Next.js on `http://localhost:3000`, and opens the app.

## Prerequisites

| Tool | Version |
| --- | --- |
| Python | 3.10 or newer |
| Node.js | 18 or newer |
| npm | Included with Node.js |

The model files should exist at:

```text
models/
  best_bandgap_model.pt
  tokenizer/
```

## Environment Variables

Create or update `.env` in the project root:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

For Google OAuth, add this redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

Optional backend variables:

| Variable | Default | Description |
| --- | --- | --- |
| `MODEL_PATH` | `models/best_bandgap_model.pt` | Path to model weights |
| `TOKENIZER_DIR` | `models/tokenizer` | Path to tokenizer directory |
| `MODEL_DEVICE` | auto | Force `cpu`, `cuda`, etc. |
| `LOG_LEVEL` | `INFO` | Backend logging level |
| `CORS_ORIGINS` | set by `start-app.bat` | Allowed frontend origins |

## Manual Backend Start

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
python -m uvicorn server.app:app --host 127.0.0.1 --port 8000
```

Health check:

```powershell
curl http://127.0.0.1:8000/health
```

## Manual Frontend Start

Open a second terminal:

```powershell
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## API Reference

### `GET /health`

Returns model status.

```json
{ "status": "ok", "model_ready": true, "device": "cpu" }
```

### `POST /predict-bandgap`

Single-text inference.

```json
{ "text": "Silicon crystallizes in diamond cubic structure and is an indirect semiconductor." }
```

### `POST /batch-predict`

Batch inference, up to 100 texts per request.

```json
{ "texts": ["Si description...", "GaAs description..."] }
```

## Useful Commands

```powershell
npm run dev
npm run build
python -m uvicorn server.app:app --host 127.0.0.1 --port 8000
```

# 🔬 Band Gap & Material Properties Predictor

An AI-powered web application that predicts crystalline material properties from plain-text descriptions using fine-tuned Transformer models. Predict band gap, formation energy, volume, density, conductivity, stability, and more.

**Key Features:**
- 🤖 Fine-tuned DistilRoBERTa-base Transformer models for multiple material properties
- 📊 Batch prediction support (up to 100 texts per request)
- 💾 PostgreSQL database with user authentication and prediction history
- 🔐 Secure Google OAuth integration with NextAuth.js
- 🎨 Modern UI with Tailwind CSS and Radix UI components
- 📱 Responsive design for desktop and mobile
- 🚀 Fast, containerized deployment with Docker Compose
- 📈 Real-time model status monitoring

**Model Performance:**
- Band Gap: MAE 0.3411 eV (trained on ~124k material descriptions from LLM-Prop dataset)
- Support for multiple material properties: formation energy, volume, density, conductivity, and stability

**Tech Stack:**
- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend:** FastAPI, PyTorch, Hugging Face Transformers
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Google OAuth
- **Deployment:** Docker Compose, containerized services

---

## 📁 Project Structure

```
.
├── docker-compose.yml              # Docker Compose configuration for services
├── middleware.ts                   # Next.js middleware for authentication
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Frontend dependencies and scripts
├── postcss.config.mjs              # Tailwind/PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── prisma/
│   ├── schema.prisma               # Database schema (Users, PredictionHistory, SharedPredictions)
│   └── migrations/                 # Database migration history
├── src/
│   ├── app/                        # Next.js App Router (pages & API routes)
│   │   ├── api/
│   │   │   ├── auth/               # NextAuth authentication endpoints
│   │   │   ├── predict/            # Prediction proxy to worker service
│   │   │   ├── history/            # User prediction history API
│   │   │   └── save-user/          # User profile API
│   │   ├── (public)/               # Public pages (login, signup, about)
│   │   ├── (protected)/            # Protected pages requiring authentication
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── profile/
│   │   │   └── share/              # Shared prediction views
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── globals.css             # Global styles
│   ├── components/                 # React UI components
│   │   ├── BandGapPredictor.tsx    # Main prediction interface
│   │   ├── PredictionResultCard.tsx
│   │   ├── SharePredictionButton.tsx
│   │   ├── SettingsMenu.tsx
│   │   ├── ProcessFlow.tsx
│   │   ├── CLIDemo.tsx
│   │   ├── AboutSection.tsx
│   │   ├── AuthPage.tsx
│   │   ├── AppLayout.tsx
│   │   └── ui/                     # Shadcn/Radix UI components
│   ├── lib/                        # Utility functions and services
│   │   ├── auth.ts                 # Authentication utilities
│   │   ├── serverAuth.ts           # Server-side auth helpers
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── bandgapApi.ts           # Band gap API client
│   │   ├── predictions.ts          # Prediction utilities
│   │   ├── users.ts                # User management
│   │   └── validation.ts           # Input validation schemas
│   ├── services/                   # Business logic services
│   │   ├── api/client.ts           # API client wrapper
│   │   ├── auth/authService.ts
│   │   ├── history/historyService.ts
│   │   ├── prediction/predictionService.ts
│   │   └── sharing/sharingService.ts
│   ├── styles/
│   │   └── theme.css               # Tailwind theme variables
│   └── types/                      # TypeScript type definitions
│       ├── api.ts
│       ├── auth.ts
│       ├── prediction.ts
│       ├── next-auth.d.ts
│       └── global.d.ts
├── worker/                         # Python FastAPI backend service
│   ├── app/
│   │   ├── api/
│   │   │   ├── router.py           # Main API router
│   │   │   ├── schemas.py          # Pydantic request/response schemas
│   │   │   └── routes/
│   │   │       ├── health.py       # Health check endpoint
│   │   │       ├── bandgap.py      # Band gap prediction
│   │   │       ├── density.py      # Density prediction
│   │   │       ├── conductivity.py # Conductivity prediction
│   │   │       └── stability.py    # Stability prediction
│   │   ├── core/
│   │   │   ├── config.py           # Configuration management
│   │   │   ├── logger.py           # Logging setup
│   │   │   ├── exceptions.py       # Custom exceptions
│   │   │   ├── model_paths.py      # Model file locations
│   │   │   ├── prediction_orchestrator.py  # Prediction coordinator
│   │   │   ├── predictor_registry.py       # Predictor registry
│   │   │   └── base_predictor.py   # Base predictor class
│   │   ├── services/
│   │   │   ├── bandgap/            # Band gap prediction service
│   │   │   └── text_regression/    # Text regression utilities
│   │   ├── shared/
│   │   │   ├── inference/          # Model inference utilities
│   │   │   ├── preprocessing/      # Data preprocessing
│   │   │   ├── schemas/            # Shared schemas
│   │   │   └── validation/         # Input validation
│   │   ├── registry.py             # Model registry and factory
│   │   └── main.py                 # FastAPI app entry point
│   ├── models/                     # Pre-trained model weights
│   │   ├── best_bandgap_model.pt   # Band gap model
│   │   ├── tokenizer/              # DistilRoBERTa tokenizer
│   │   └── [other models]/         # Formation energy, volume, etc.
│   ├── Dockerfile                  # Python worker image
│   ├── main.py                     # Worker module entry
│   ├── requirements.txt            # Python dependencies
│   └── run.py                      # Development runner
└── final_dataset_3870.csv          # Training dataset reference
```

---

## 🚀 Quick Start

### Option 1: Windows Batch Script (Easiest)

Double-click to run:
```
start-app.bat
```

This script will:
- Create and activate Python virtual environment (`.venv`)
- Install Python dependencies
- Install npm dependencies (if needed)
- Start FastAPI backend on `http://127.0.0.1:8000`
- Start Next.js frontend on `http://localhost:3000`
- Automatically open the app in your browser

### Option 2: Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- FastAPI worker on port 8000
- Frontend on port 3000

### Option 3: Manual Setup

See [Manual Setup](#manual-setup) below.

---

## 📋 Prerequisites

| Tool | Version | Required |
| --- | --- | --- |
| Python | 3.10+ | Yes |
| Node.js | 18+ | Yes |
| npm | Latest | Yes |
| PostgreSQL | 12+ | Yes |
| Docker | Latest | Optional (for containerized deployment) |

**Model Files Required:**
The following model files must exist in `worker/models/`:
```
worker/models/
  best_bandgap_model.pt
  tokenizer/
    tokenizer.json
    tokenizer_config.json
    config.json
```

---

## ⚙️ Environment Setup

### 1. Create Environment File

Copy the example configuration:
```bash
cp .env.example .env.local
```

### 2. Configure `.env.local`

```env
# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-random-secret-key>
APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmprop"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/llmprop"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# GitHub OAuth (optional, for future use)
GITHUB_CLIENT_ID=<optional>
GITHUB_CLIENT_SECRET=<optional>

# Worker Service
WORKER_API_URL=http://localhost:8000
PREDICTION_TIMEOUT_MS=120000
```

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Then paste the output into `NEXTAUTH_SECRET` in `.env.local`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google OAuth 2.0
4. Create OAuth credentials (Web Application)
5. Add Authorized Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret to `.env.local`

---

## 📦 Manual Setup

### Backend Setup

```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# or
.\.venv\Scripts\activate.bat  # Windows CMD
# or
source .venv/bin/activate  # macOS/Linux

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
python -m pip install -r requirements.txt

# Set CORS origins (Windows PowerShell)
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Start FastAPI server
python -m uvicorn worker.app:app --host 127.0.0.1 --port 8000 --reload
```

**Health Check:**
```powershell
curl http://127.0.0.1:8000/health
```

### Frontend Setup

Open a new terminal:

```powershell
# Install dependencies
npm install

# Setup database (run migrations)
npx prisma migrate dev

# Start development server
npm run dev
```

Visit: `http://localhost:3000`

---

## 🗄️ Database Setup

### Initialize Database with Prisma

```bash
# Run migrations
npx prisma migrate dev

# View database in Prisma Studio (web UI)
npx prisma studio
```

### Database Schema

The application uses three main tables:

**users**
- Stores user profiles with Google OAuth integration
- Fields: id, name, email, image, createdAt, updatedAt

**prediction_history**
- Stores user predictions and results
- Fields: id, prompt, result (JSON), userId, createdAt
- Indexed on: userId, createdAt

**shared_predictions**
- Manages public shares of predictions
- Fields: id, title, predictionId, shareToken, userId, createdAt
- Indexed on: userId, shareToken

---

## 🔌 API Reference

### Health Check
```http
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok",
  "model_ready": true,
  "device": "cpu"
}
```

### Single Prediction
```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "text": "Silicon crystallizes in diamond cubic structure and is an indirect semiconductor.",
  "model": "bandgap"
}
```

**Response:**
```json
{
  "properties": {
    "band_gap": 1.12
  },
  "metadata": {
    "model": "bandgap",
    "inference_time_ms": 45.2,
    "confidence": 0.92
  }
}
```

### Batch Prediction
```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "texts": [
    "Silicon crystallizes in diamond cubic structure...",
    "Gallium arsenide with zinc blende structure..."
  ],
  "model": "bandgap"
}
```

### Available Prediction Models
- `bandgap` - Band gap energy prediction
- `formation_energy` - Formation energy prediction
- `volume` - Crystal volume prediction
- `density` - Material density prediction
- `conductivity` - Electrical conductivity prediction
- `stability` - Material stability prediction

---

## 🎯 Features

### User Authentication
- ✅ Google OAuth 2.0 integration
- ✅ Secure JWT session management
- ✅ Protected pages and API routes
- ✅ User profile management

### Prediction System
- ✅ Real-time material property predictions
- ✅ Batch processing (up to 100 texts)
- ✅ Prediction history with timestamps
- ✅ Confidence scores and metadata
- ✅ Model status monitoring

### Data Management
- ✅ Save predictions to user history
- ✅ Share predictions via unique links
- ✅ Export prediction results
- ✅ Prediction analytics dashboard

### UI/UX
- ✅ Modern, responsive design
- ✅ Real-time result display
- ✅ CLI demo mode
- ✅ Process flow visualization
- ✅ Skeleton loading states
- ✅ Toast notifications

---

## 📊 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Database
```bash
npm run db:migrate:dev    # Create/run migrations
npm run db:migrate:deploy # Deploy migrations
npm run db:studio         # View database in browser
npm run db:reset          # Reset database (development only)
npm run db:push           # Sync schema with database
```

### Backend
```bash
python -m uvicorn worker.app:app --reload
python run.py          # Development with hot reload
```

---

## 🐛 Troubleshooting

### Issue: "Model not found" error
**Solution:** Ensure model files exist in `worker/models/` directory and are properly loaded.

### Issue: Database connection refused
**Solution:** 
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env.local` is correct
3. Run `npx prisma db push` to create tables

### Issue: CORS errors
**Solution:** Ensure `CORS_ORIGINS` environment variable includes your frontend URL

### Issue: Port already in use
**Solution:** Change the port or kill the process using it:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Python virtual environment not activating
**Solution:** Use the full path or check execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

---

## 🔐 Security Considerations

- ✅ HTTPS enforced in production
- ✅ Secure cookies with SameSite flags
- ✅ CSRF protection via NextAuth
- ✅ Input validation on frontend and backend
- ✅ SQL injection prevention via Prisma ORM
- ✅ Rate limiting recommended for production
- ✅ Environment variables for sensitive data

**Production Checklist:**
- [ ] Set `NEXTAUTH_SECRET` to a cryptographically secure random string
- [ ] Use HTTPS for all URLs (update env vars)
- [ ] Configure database connection pooling
- [ ] Enable logging and monitoring
- [ ] Set up backup/restore procedures
- [ ] Configure CDN for static assets
- [ ] Enable rate limiting on API routes

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 📞 Support & Resources

- **Documentation:** See project README and inline code comments
- **Issues:** Report bugs via GitHub Issues
- **Discussions:** Use GitHub Discussions for questions
- **FastAPI Docs:** http://localhost:8000/docs (when running)
- **Prisma Studio:** `npm run db:studio` (development only)

---

## 🎓 References

- [LLM-Prop Dataset](https://github.com/your-repo/llm-prop)
- [DistilRoBERTa Model](https://huggingface.co/distilroberta-base)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Last Updated:** June 6, 2026  
**Version:** 1.0.0

```json
{ "texts": ["Si description...", "GaAs description..."] }
```

## Useful Commands

```powershell
npm run dev
npm run build
python -m uvicorn server.app:app --host 127.0.0.1 --port 8000
```

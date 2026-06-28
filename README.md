# MulePulse

**Fraud intelligence workspace for pre-emptive mule network detection.**

Built for **NexHack 2026 Track 2: Fintech Risk & Fraud Intelligence**.

MulePulse helps bank fraud analysts detect coordinated mule account networks before victim reports arrive — by analyzing transaction graphs, velocity patterns, fan-in/fan-out behavior, and proximity to known mule repositories.

---

## Project Structure

```
Nexhack/
├── frontend_edited/    # Analyst dashboard + landing page (connected to backend)
└── backend/            # FastAPI + ML backend
    ├── app/            # API application
    ├── ml/             # ML training pipeline
    ├── alembic/        # Database migrations
    ├── secrets/        # API keys & config (not committed)
    ├── Dockerfile
    ├── docker-compose.yml
    └── requirements.txt
```

---

## Quick Start

### Step 1 — Set up secrets

See `backend/secrets/README.md` for required API keys and config values.

### Step 2 — Train the ML model (first time only)

```bash
cd backend
pip install -r requirements.txt
python ml/data_gen.py
python ml/feature_pipeline.py
python ml/train.py
```

ML artifacts are saved to `backend/ml/artifacts/`:
- `mule_scorer.pkl` — trained XGBoost model
- `feature_names.pkl` — feature list
- `shap_summary.png` — SHAP feature importance chart

### Step 3 — Start the backend

Open a terminal in the `backend/` folder:

```bash
cd backend
docker compose up --build
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### Step 4 — Seed test data

Open a **new terminal** (separate from the Docker process) and run:

```bash
cd backend
python ml/data_gen.py --seed-api
```

### Step 5 — Serve the frontend

Open another new terminal from the **root of the repo**:

```bash
python -m http.server 5500
```

### Step 6 — Open in browser

```
http://localhost:5500/frontend_edited/
```

> **Login credentials** (for `POST /auth/token`):
> - Email: `admin@muledetect.local`
> - Password: `hackathon2026`

---

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /auth/token` | Login, get JWT |
| `GET /api/clusters` | List all clusters with risk scores |
| `GET /api/cluster/{id}` | Single cluster detail |
| `GET /api/cluster/{id}/report` | AI-generated risk report |
| `GET /api/graph` | Transaction graph (nodes + edges) |

---

## Backend Stack

| Layer | Technology |
|---|---|
| API | FastAPI + Uvicorn |
| Database | PostgreSQL + Alembic |
| ML Scoring | XGBoost + SHAP |
| Graph Engine | NetworkX + Louvain |
| AI Reports | OpenRouter (primary + fallback LLM) |
| Auth | JWT (python-jose) + bcrypt |

---

## Demo Flow

1. Open the frontend — landing page introduces the product
2. Enter the analyst dashboard
3. Select a high-risk cluster from the queue
4. Inspect the transaction graph and account evidence
5. Review the AI-generated case summary
6. Approve an action: **Monitor**, **Escalate**, or **Freeze**
7. Adjust the risk threshold slider to see alert-volume trade-offs

> Full analyst workflow can be demonstrated end-to-end within 7 minutes.

---

## Technical Architecture

```
Transaction Stream → Graph Engine → Feature Extraction → Risk Scoring → AI Investigation Agent
                                                                              ↓
                                                              Analyst Approval → Case Log → Feedback Loop
```

1. **Data ingestion** — transaction stream, account metadata, device/IP signals, known mule repository
2. **Graph engine** — directed time-aware account graph with weighted edges
3. **Feature extraction** — fan-in, fan-out, pass-through velocity, shared identifiers, mule proximity
4. **Risk scoring** — XGBoost model with threshold controls and SHAP explainability
5. **AI investigation agent** — case-file generation, plain-language explanation, recommended action

---

## Repositories

- [backend/](./backend) — FastAPI backend, ML pipeline, AI agent, database
- [frontend_edited/](./frontend_edited) — Analyst dashboard and landing page (backend-connected)

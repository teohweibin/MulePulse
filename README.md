# MulePulse

**Fraud intelligence workspace for pre-emptive mule network detection.**

Built for **NexHack 2026 Track 2: Fintech Risk & Fraud Intelligence**.

MulePulse helps bank fraud analysts detect coordinated mule account networks before victim reports arrive — by analyzing transaction graphs, velocity patterns, fan-in/fan-out behavior, and proximity to known mule repositories.

---

## Project Structure

```
Nexhack/
├── index.html          # Landing page
├── dashboard.html      # Analyst dashboard
├── app.js              # Dashboard logic
├── landing.js          # Landing page logic
├── styles.css          # Landing styles
├── dashboard.css       # Dashboard styles
├── backend/            # FastAPI + ML backend
│   ├── app/            # API application
│   ├── ml/             # ML training pipeline
│   ├── alembic/        # Database migrations
│   ├── secrets/        # API keys & config (not committed)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
└── docs/
    └── PRD.md          # Full product requirements
```

---

## Frontend

Dependency-free prototype. No build step required.

### Run

Open `index.html` directly in a browser.

### Pages

| File | Purpose |
|---|---|
| `index.html` | Public landing page, no-login, explains the product |
| `dashboard.html` | Analyst workspace — cluster queue, graph, case file |

### Features

- Prioritized mule cluster queue sorted by network risk score
- Interactive transaction graph with directed fund-flow edges
- Account-level feature panel (fan-in, fan-out, velocity, mule proximity)
- AI-generated plain-language explanation per flagged cluster
- Analyst action controls: **Monitor**, **Escalate**, **Freeze**
- Risk threshold slider with precision/recall trade-off estimate
- Human-in-the-loop case activity log

---

## Backend

FastAPI + PostgreSQL backend with XGBoost ML scoring and AI-generated risk reports.

### Stack

| Layer | Technology |
|---|---|
| API | FastAPI |
| Database | PostgreSQL + Alembic |
| ML Scoring | XGBoost + SHAP |
| Graph Engine | NetworkX + Louvain |
| AI Reports | OpenRouter (GPT / GLM fallback) |

### Quick Start

#### 1. Set up secrets
See `backend/secrets/README.md` for required API keys and config values.

#### 2. Train the ML model
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

#### 3. Start the backend
```bash
docker compose up --build
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

#### 4. Seed test data
```bash
python ml/data_gen.py --seed-api
```

#### 5. Login
Use these credentials in `POST /auth/token`:
- Email: `admin@muledetect.local`
- Password: `hackathon2026`

### API Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /auth/token` | Login, get JWT |
| `GET /api/clusters` | List all clusters with risk scores |
| `GET /api/cluster/{id}` | Single cluster detail |
| `GET /api/cluster/{id}/report` | AI-generated risk report |
| `GET /api/graph` | Transaction graph (nodes + edges) |

---

## Demo Flow

1. Open `index.html` — landing page introduces the product
2. Enter the analyst dashboard
3. Select a high-risk cluster from the queue
4. Inspect the transaction graph and account evidence
5. Review the AI-generated case summary
6. Approve an action: Monitor, Escalate, or Freeze
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

See [`docs/PRD.md`](docs/PRD.md) for full product requirements.

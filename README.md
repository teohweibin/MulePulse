# MulePulse — by Team HAHA

> **AI-powered fraud intelligence workspace for pre-emptive mule network detection.**

Built for **NexHack 2026 Track 2: Fintech Risk & Fraud Intelligence**.

---

## Live Demo

> **No setup required** — open directly in your browser:
>
> 🔗 https://teohweibin.github.io/MulePulse/

The live demo runs with built-in mock data when the backend is offline.

📄 **Pitch Deck:** https://drive.google.com/file/d/1lZrA1oyxQ5MlyP5DnsXgpTA5PimhrqaW/view?usp=drive_link

---

## The Problem

Malaysia's current counter-fraud response excels at reactive tracing — but **post-scam fund recovery has become a critical failure point** due to accelerating mule networks.

| Metric | Figure |
|---|---|
| Cumulative Fraud Losses (2023–2025) | **RM 5.62B** — RM1.28B (2023) → RM1.57B (2024) → RM2.77B (2025) |
| Active Mule Accounts in 2025 | **87,209** — a 70% YoY acceleration from 51,302 in 2024 |
| Scam Fund Recovery Rate (2025) | **<2%** — only RM34M intercepted out of RM2.77B in nationwide losses |

**The Blind Spot:**
In **95% of Malaysian scams**, victims knowingly authorize transfers. The outbound transaction appears legitimate to isolated, bank-level rule engines.

**The True Signal:**
The fraud signal resides on the *receiving side* — hidden within the **structure, velocity, and fan-out behaviour** of the mule network. Most AML systems evaluate accounts in isolation and miss this entirely.

MulePulse fills the **missing layer** between raw transaction monitoring and post-report fund tracing: **pre-emptive mule network discovery with explainable, human-approved analyst workflows**.

---

## Solution

MulePulse is an **analyst-facing fraud intelligence workspace** that detects coordinated mule account networks *before* victim reports arrive — built as a four-layer pipeline:

```
Transaction Stream
       │
       ▼
  Layer 1: Transaction Graph Engine
  Ingests streams to build directed, time-aware account graphs.
  Edges weighted by velocity and time-decay.
       │
       ▼
  Layer 2: Suspicious Pattern Extraction
  Fan-in, Fan-out, Pass-through velocity signals.
  Community detection to surface entire coordinated rings.
       │
       ▼
  Layer 3: Mule Risk Scoring (XGBoost + SHAP)
  Combines graph features into calibrated risk scores.
  Evaluates entire clusters simultaneously with tunable thresholds.
       │
       ▼
  Layer 4: AI Investigation Agent (LLM via OpenRouter)
  Auto-assembles case files with plain-language, explainable narratives.
  Recommends actions; explicitly requires human analyst approval.
       │
       ▼
  Analyst Approval ──► Case Log ──► Feedback Loop ──► Model Retraining
```

**Every enforcement action requires human approval.** The AI recommends; the analyst decides. Analyst decisions feed back into model calibration over time.

---

## Key Features

| Feature | Description |
|---|---|
| 🕸️ Transaction Graph Workspace | Directed fund-flow graph with fan-in, fan-out, and pass-through nodes highlighted |
| 📋 Cluster Risk Queue | Prioritized list of suspicious account clusters by network-level risk score |
| 🤖 AI Investigation Agent | Autonomous case-file generator: implicated accounts, transaction chain, graph features, recommended action |
| 💡 SHAP Explainability | Every score has a plain-language breakdown — "flagged primarily because: fan-out velocity 3× normal, shared device ID with confirmed mule" |
| 🎚️ Threshold Tuning | Analysts adjust sensitivity with real-time precision/recall trade-off visibility |
| ✅ Human-in-the-Loop | Monitor / Escalate / Freeze actions are always analyst-approved and logged |
| 🔄 Feedback Loop | Analyst decisions captured and fed back into future model scoring |

---

## Target Market

### Primary Buyer: National Central Operator (PayNet / NFP)

MulePulse serves a **single strategic buyer: PayNet**, the national Central Operator — delivering simultaneous, cross-institutional protection for the entire Malaysian financial market.

**Why Central Operator, not individual banks?**

| Problem | Why Individual FIs Can't Solve It | Why PayNet Can |
|---|---|---|
| Mule syndicates **fragment across multiple institutions** | Each bank only sees its own slice | PayNet has lawful, cross-institutional visibility |
| Mule networks **deliberately stay below per-bank thresholds** | Per-bank rules miss the network | Cross-bank graph reveals the full ring |
| **One procurement → system-wide protection** | Each bank must buy separately | One deployment protects every participating bank, e-wallet, and consumer |

Individual FIs act as **supporting data partners**. MulePulse acts as the **missing pre-emptive discovery layer** atop the existing National Fraud Portal (NFP) stack — not a replacement for it.

### Positioning — What MulePulse Is NOT

MulePulse is **not** a replacement for core fraud engines (Featurespace, FICO, SAS AML).
It is a **pre-emptive investigation layer** deployed *above* existing systems — surfacing network-level risk that rule engines miss entirely.

---

## Competitive Differentiation

| Competitor | Approach | MulePulse Advantage |
|---|---|---|
| **Featurespace** | Behavioral rule engine, per-account | MulePulse adds *network-level* graph context across account clusters |
| **FICO Falcon** | Score-based alerts, historical patterns | MulePulse explains *why* via SHAP + plain-language AI narratives |
| **Manual SAR Review** | Human review of flagged transactions | MulePulse pre-triages networks, reducing analyst workload significantly |
| **Generic LLM Chatbots** | Reactive Q&A | MulePulse is an autonomous agentic pipeline: graph → features → score → case file → feedback |

### The Network Effect Moat

As more institutions contribute confirmed mule labels through the NFP, the proximity-to-mule signal strengthens for every participant. **No individual bank's rule engine can replicate a national-level mule intelligence network.**

---

## Business Model

| Model | Description |
|---|---|
| **Central Operator License** | Single enterprise license to PayNet — covers all participating institutions |
| **Pilot Package** | Backtest on operator's historical data + confirmed-mule repository, quantifying lead time gained vs. victim reports |
| **Shadow Mode Evaluation** | Score live transactions in parallel with no enforcement action — validates accuracy before go-live |
| **Enterprise Private Deployment** | On-premise or private cloud with full data controls, PDPA-compliant |

---

## Regulatory Compliance

MulePulse is designed to align with Malaysia's active regulatory obligations:

### Operational Governance (BNM)

- Positioned within the **PayNet / NFP operator tier under BNM oversight**
- Inherits the lawful basis used to share mule and fraud data across institutions
- Rigorously conforms to **BNM Risk Management in Technology (RMiT)** standards

### Data Protection (PDPA 2010)

- Processing permitted under the **crime-prevention and detection exemption (Section 45, PDPA 2010)**
- Built to meet PDPA's **2024 security, breach-notification, and DPO obligations**

MulePulse positions as a **compliance accelerator** — making it easier for the operator and FIs to meet existing regulatory obligations, not just an analytics tool.

---

## Implementation Plan

```
Phase 1 — Proof of Value on Historical Data (3–4 months)
  ● Backtest on PayNet's historical data and confirmed-mule repository (NFP)
  ● NFP mule database powers detection as training labels, graph anchors, and backtest ground truth
  ● Quantify lead time gained ahead of victim reports
  ● Engage early high-volume reference partners

Phase 2 — Shadow Mode Evaluation on Live Data (4–6 months)
  ● Score live transactions in parallel — no enforcement action taken
  ● Validates accuracy, false positives, and timing before production
  ● Existing fraud-response process stays fully authoritative throughout
  ● Broaden participation to highest-volume institutions for maximum early coverage

Phase 3 — Production Deployment & Analyst Workflow (6 months)
  ● AI Investigation Agent delivers explainable case files to operator-level case officers
  ● Every irreversible action requires human approval — never autonomous, fully logged for audit
  ● Extend participation to mid-sized and smaller institutions for full-breadth coverage

Phase 4 — Continuous Learning & Operational Maturity (ongoing)
  ● Analyst decisions retrain the model — sharper precision, fewer repeat false positives
  ● Confirmed mules enrich the NFP database — operator's ground truth and model improve together
  ● Full national coverage reached; network effect matures as visibility completes
  ● De-risked by design: institutions onboard through existing NFP connections, phase by phase
```

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| **API** | FastAPI + Uvicorn |
| **Database** | PostgreSQL + Alembic (schema migrations) |
| **ML Scoring** | XGBoost + SHAP |
| **Graph Engine** | NetworkX + Louvain community detection |
| **AI Investigation Agent** | OpenRouter (GPT-class primary + GLM-4.5 fallback) |
| **Auth** | JWT (python-jose) + bcrypt |
| **Containerization** | Docker + docker-compose |

### ML Artifacts (trained, committed)

| Artifact | Description |
|---|---|
| `ml/artifacts/mule_scorer.pkl` | Trained XGBoost model |
| `ml/artifacts/feature_names.pkl` | Feature list for inference |
| `ml/artifacts/shap_summary.png` | SHAP feature importance chart |

Alembic migration history is committed, showing the full database evolution. The model was trained on a synthetic mule network dataset with realistic fan-in/fan-out and pass-through patterns.

### Feedback Loop

Analyst decisions (Monitor / Escalate / Freeze) are logged to the case activity log. These labels become ground-truth feedback for future model retraining — closing the loop from analyst judgment back to model calibration, and enriching the NFP confirmed-mule repository over time.

---

## Project Structure

```
Nexhack/
├── frontend_edited/    # Analyst dashboard + landing page (backend-connected)
├── backend/            # FastAPI + ML backend
│   ├── app/            # API application
│   ├── ml/             # ML training pipeline + SHAP artifacts
│   ├── alembic/        # Database migrations
│   ├── secrets/        # API keys & config (not committed)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── start.bat           # One-click startup (Windows)
└── start.sh            # One-click startup (Mac / Linux)
```

---

## Quick Start — Option A: One-click script (Recommended)

Requires: **Docker Desktop**, **Python 3.11+**

**Windows:**
```bat
start.bat
```

**Mac / Linux:**
```bash
chmod +x start.sh
./start.sh
```

The script will automatically:
1. Train the ML model on first run
2. Start the backend via Docker
3. Seed test data
4. Open `http://localhost:5500/frontend_edited/` in your browser

---

## Quick Start — Option B: Docker only (One command)

After secrets are configured:

```bash
cd backend
docker compose up --build
```

This starts:
- **API** at `http://localhost:8000`
- **Frontend** at `http://localhost:5500` (served by nginx)

Then in a new terminal, seed the data:

```bash
cd backend
python ml/data_gen.py --seed-api
```

---

## Quick Start — Option C: Manual setup

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

### Step 3 — Start the backend

```bash
cd backend
docker compose up --build
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### Step 4 — Seed test data

Open a **new terminal** (separate from the Docker process):

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

## Demo Flow

1. Open the frontend — landing page introduces the product and business context
2. Enter the analyst dashboard
3. Select a high-risk cluster from the prioritized queue
4. Inspect the transaction graph — accounts, fund flow, known mule links, pass-through nodes
5. Review the AI-generated case summary with plain-language SHAP explanation
6. Approve an action: **Monitor**, **Escalate**, or **Freeze**
7. Adjust the risk threshold slider to see alert-volume / precision-recall trade-offs

> Full analyst workflow demonstrated end-to-end within 7 minutes.

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

## Repositories

- [backend/](./backend) — FastAPI backend, ML pipeline, AI agent, database
- [frontend_edited/](./frontend_edited) — Analyst dashboard and landing page (backend-connected)

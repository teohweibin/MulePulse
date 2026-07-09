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

Banks lose billions every year to money mule networks — but most AML systems evaluate accounts **in isolation**, one transaction at a time. Mule networks exploit this by splitting funds across dozens of accounts, keeping each individual transaction below rule thresholds.

**The strongest fraud signal is at the network level**, not the account level:
- Fast pass-through behavior across chains of accounts
- Coordinated fan-in / fan-out patterns
- Shared device IDs, IP addresses, or phone numbers across accounts
- Proximity to previously confirmed mule accounts

**The result:** Banks take an average of **47+ days** to detect an active mule network. By then, funds are gone, victims have filed reports, and regulatory exposure has already occurred.

MulePulse fills the **missing layer** between raw transaction monitoring and post-report fund tracing: **pre-emptive network discovery with explainable, human-approved analyst workflows**.

---

## Solution

MulePulse is an **analyst-facing fraud intelligence workspace** that detects coordinated mule account networks *before* victim reports arrive.

```
Transaction Stream
       │
       ▼
  Graph Engine ──────────────────────────────────────────────────┐
  (NetworkX + Louvain)                                           │
  Builds directed time-aware account graph                       │
       │                                                         │
       ▼                                                         │
  Feature Extraction                                             │
  Fan-in, Fan-out, Pass-through velocity,                        │
  Shared identifiers, Mule proximity score                       │
       │                                                         │
       ▼                                                         │
  Risk Scoring (XGBoost + SHAP)                                  │
  Account-level + cluster-level score                            │
  Threshold controls & precision/recall visibility               │
       │                                                         │
       ▼                                                         │
  AI Investigation Agent (LLM via OpenRouter) ◄─────────────────┘
  Case-file generation, plain-language explanation,
  recommended action (Monitor / Escalate / Freeze)
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
| 🔄 Feedback Loop | Analyst decisions are captured and feed back into future model scoring |

---

## Target Market

### Primary Buyers

| Segment | Pain Point | Why MulePulse |
|---|---|---|
| **Tier 1 & 2 Banks** | High SAR filing cost; slow mule detection | Network-level pre-emptive detection before victim reports |
| **Digital Banks / Neobanks** | Lightweight fraud stack; no graph analytics | Drop-in fraud intelligence layer, no core system replacement |
| **E-wallet Providers** | Fast fund movement; peer-to-peer abuse | Real-time fan-out pattern detection across wallet accounts |
| **Payment Processors** | Cross-bank mule routing | Pass-through velocity and proximity-to-mule scoring |
| **RegTech Vendors** | Need differentiated AML product | White-label graph intelligence layer |

### Positioning — What MulePulse Is NOT

MulePulse is **not** a replacement for core fraud engines (Featurespace, FICO, SAS AML).
It is a **pre-emptive investigation layer** deployed alongside existing systems — surfacing network-level risk that rule engines miss entirely.

---

## Competitive Differentiation

| Competitor | Approach | MulePulse Advantage |
|---|---|---|
| **Featurespace** | Behavioral rule engine, per-account | MulePulse adds *network-level* graph context across account clusters |
| **FICO Falcon** | Score-based alerts, historical patterns | MulePulse explains *why* via SHAP + plain-language AI narratives |
| **Manual SAR Review** | Human review of flagged transactions | MulePulse pre-triages networks, reducing analyst workload significantly |
| **Generic LLM Chatbots** | Reactive Q&A | MulePulse is an autonomous agentic pipeline: graph → features → score → case file → feedback |

### The Network Effect Moat

The more institutions that contribute confirmed mule labels to the shared mule repository, the stronger the proximity-to-mule signal becomes for every participant. **No individual bank's rule engine can replicate a consortium-level mule intelligence network.**

---

## Business Model

| Model | Target | Description |
|---|---|---|
| **Annual SaaS License** | Banks & digital banks | Per-institution pricing based on transaction volume |
| **Per-seat Analyst Workspace** | Smaller fintechs | Per fraud analyst seat pricing |
| **Pilot Package** | New customers | Synthetic/historical transaction replay + model calibration |
| **Enterprise Deployment** | Large banks | Private cloud or on-premise with full data controls |

---

## Regulatory Compliance Framing

MulePulse is designed to align with active regulatory obligations in Southeast Asia:

| Regulation | Relevance |
|---|---|
| **MAS Notice 626** (Singapore) | AML/CFT controls for banks — mule account detection directly supports suspicious transaction reporting obligations |
| **BNM RMiT** (Malaysia) | Risk Management in Technology — graph-based detection with explainability supports audit trail requirements |
| **JFMC Mule Reporting** (Malaysia) | Joint Financial Mule Committee mule reporting framework — MulePulse outputs map to JFMC reporting fields |
| **FATF Recommendation 16** | Wire transfer traceability — MulePulse's transaction chain reconstruction supports FATF travel rule compliance |

MulePulse positions as a **compliance accelerator** — making it easier for banks to meet existing regulatory obligations, not just a nice-to-have analytics tool.

---

## Go-to-Market Roadmap

```
Phase 1 — Pilot (0–6 months)
  ● Deploy with 1 regional bank (anonymized historical data)
  ● 50 fraud analysts on-boarded
  ● On-premise or private cloud deployment
  ● Baseline: reduce triage time per cluster from hours to minutes

Phase 2 — Integration (6–18 months)
  ● API integration with existing fraud case management systems
  ● Expand to 3+ banks and 1 e-wallet provider
  ● Add near-real-time stream ingestion
  ● Analyst feedback loop drives model recalibration

Phase 3 — Consortium (18–36 months)
  ● Cross-institution shared mule intelligence network
  ● Confirmed mule labels shared (privacy-preserving) across participants
  ● Expand typologies: scam prevention, AML, account-opening risk
  ● Explore PayNet NFP integration as external enrichment source
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

Analyst decisions (Monitor / Escalate / Freeze) are logged to the case activity log. These labels become ground-truth feedback for future model retraining — closing the loop from analyst judgment back to model calibration.

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

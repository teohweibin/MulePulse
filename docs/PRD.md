# MulePulse PRD

## 1. Product Summary

MulePulse is an analyst-facing fraud intelligence workspace for Malaysian fintech and banking teams. It detects coordinated mule account networks before victim reports arrive by analyzing transaction relationships, velocity, fan-in/fan-out behavior, and proximity to known mule repositories.

The MVP is a public no-login frontend prototype that demonstrates how a bank fraud reviewer, judge, or business stakeholder can review flagged mule clusters, inspect graph evidence, understand AI-generated explanations, tune alert sensitivity, and approve recommended actions such as monitor, escalate, or freeze.

This project is designed for NexHack 2026 Track 2: Fintech Risk & Fraud Intelligence. It intentionally solves one narrow, high-value workflow deeply: pre-emptive mule-network discovery and analyst-led disruption.

## 2. Problem

Existing AML systems often evaluate accounts and transactions in isolation. Mule networks exploit that limitation by splitting funds across many accounts quickly, keeping individual transactions below obvious rule thresholds. The strongest fraud signal appears at the network level: fast pass-through behavior, coordinated fan-in/fan-out, shared identifiers, and links to previously confirmed mule accounts.

The product addresses the missing layer between raw transaction monitoring and post-report fund tracing: pre-emptive network discovery with explainable, controllable analyst workflows.

## 3. Target Users

- Fraud operations analysts reviewing suspicious account clusters.
- AML investigation leads prioritizing high-risk networks.
- Bank risk teams tuning alert thresholds against investigation capacity.
- Compliance reviewers who need clear rationale for escalations.

## 4. Goals

- Surface mule risk at both account and cluster level.
- Show transaction graph evidence in a way analysts can understand quickly.
- Explain why a cluster was flagged using human-readable feature evidence.
- Keep every enforcement action human-approved.
- Demonstrate feedback loops from analyst decisions to future scoring.
- Make technical architecture, business value, adoption path, and compliance controls easy to communicate in a 7-minute demo.

## 5. Non-Goals For MVP

- Real banking integrations.
- Production authentication and role management.
- Live model training.
- Actual freeze or fund-recovery execution.
- Full PayNet National Fraud Portal integration.

## 6. MVP User Flows

### Flow A: Triage A Flagged Cluster

1. Analyst opens the dashboard and sees a prioritized queue of mule clusters.
2. Analyst selects a high-risk cluster.
3. Graph view highlights accounts, fund movement, known mule links, and pass-through nodes.
4. Case file shows risk score, triggered features, affected amount, time window, and AI explanation.
5. Analyst chooses monitor, escalate, or freeze recommendation.

### Flow B: Tune Alert Sensitivity

1. Analyst adjusts the risk threshold slider.
2. Queue updates to show which clusters remain above threshold.
3. Precision/recall estimate changes to show operational trade-offs.
4. Analyst can reset to the recommended threshold.

### Flow C: Review AI Investigation Agent Output

1. Analyst runs the investigation agent.
2. Agent assembles a case summary with implicated accounts, transaction chain, triggered graph features, and recommendation.
3. Analyst approves, rejects, or modifies the recommendation.
4. Decision is logged as feedback for future scoring.

## 7. Key Features

- Transaction graph workspace with directed fund-flow edges.
- Cluster queue sorted by network-level risk score.
- Account-level feature panel for fan-in, fan-out, velocity, and mule proximity.
- Plain-language AI explanation for each flagged cluster.
- Analyst action controls: monitor, escalate, freeze.
- Threshold tuning with estimated alert volume and recall/precision trade-off.
- Case activity log for human-in-the-loop accountability.
- Rubric-aligned proof points for problem impact, technical execution, market adoption, innovation, and presentation.

## 8. Data Model For Prototype

- Account: id, role, risk score, balance movement, known mule status, shared identifiers.
- Transfer: source, target, amount, timestamp, channel, velocity flag.
- Cluster: id, accounts, risk score, total amount, first seen, last seen, triggered features, recommendation.
- Case action: timestamp, analyst, action type, decision note.

## 9. UX Principles

- Landing-first, no-login experience that explains the product before asking the user to operate it.
- Non-technical language first, with technical evidence still available inside the workflow.
- Explainability first: every score needs evidence beside it.
- Human control is visible: recommendations never look autonomous.
- Graph state and case details stay synchronized.
- Sui-inspired visual direction: large confident typography, pale blue surfaces, modular product sections, pill navigation, and trust/verification language.

## 10. Success Metrics

- Analysts can identify the riskiest cluster in under 30 seconds.
- Analysts can understand why a cluster was flagged without model jargon.
- Threshold tuning makes alert-volume trade-offs obvious.
- Every enforcement recommendation has an explicit human approval step.

## 11. NexHack Rubric Alignment

| Judging Area | Product Response |
| --- | --- |
| Problem Relevance & Impact | Targets scam-loss recovery failure and mule laundering speed, with clear banking fraud-ops users and measurable risk reduction. |
| Technical Architecture & Execution | Demonstrates graph ingestion, feature extraction, risk scoring, AI investigation agent, and human approval loop. |
| Market Adoption & Commercial Potential | Designed for banks, e-wallets, payment processors, and regtech vendors as a fraud-ops intelligence layer. |
| Innovation & Differentiation | Goes beyond chatbots and single-account AML rules by using network intelligence, proactive alerts, explainability, and agentic case assembly. |
| Presentation & Demonstration | Provides a focused analyst workflow that can be shown end-to-end within the 7-minute preliminary video limit. |

## 12. Commercial Adoption

Primary buyers are banks, digital banks, e-wallet providers, payment processors, and regtech vendors operating in Malaysia. The clearest adoption wedge is a fraud-operations copilot deployed beside existing AML/rule engines rather than replacing core banking systems.

Potential pricing models:

- Per institution annual SaaS license based on transaction volume.
- Per-seat fraud analyst workspace for smaller fintechs.
- Pilot package with synthetic/historical transaction replay and model calibration.
- Enterprise deployment with private cloud or on-premise data controls.

Implementation roadmap:

1. MVP demo with synthetic mule network data and explainable analyst workflow.
2. Pilot with anonymized historical transaction graph and confirmed mule labels.
3. Integrate alert export into fraud case management systems.
4. Add near-real-time stream ingestion and feedback-based model calibration.
5. Expand from mule networks to scam prevention, AML typologies, and account-opening risk.

## 13. Technical Architecture

The intended production architecture has five layers:

1. Data ingestion: transaction stream, account metadata, device/IP signals, known mule repository enrichment.
2. Graph engine: directed time-aware account graph with weighted edges and incremental updates.
3. Feature extraction: fan-in, fan-out, pass-through velocity, shared identifiers, mule proximity, community detection.
4. Risk scoring: calibrated account and cluster scoring with threshold controls and precision/recall visibility.
5. AI investigation agent: case-file generation, plain-language explanation, recommended action, and analyst feedback capture.

## 14. Demo Submission Checklist

- GitHub repository contains PRD, README, and runnable prototype.
- Demo flow shows one complete case from alert to analyst action.
- Pitch explains target customer, pain point, value proposition, architecture, pricing, and roadmap.
- Demo video stays below 7 minutes to avoid penalties.
- Deployment can be GitHub Pages, local browser, or hosted static site.

## 15. Open Questions

- Should the demo position PayNet NFP as an external enrichment source, a simulated repository, or a future integration?
- Which user persona should lead the pitch: bank fraud analyst, regulator, or fintech risk platform buyer?
- Should the prototype include Bahasa Malaysia labels for local judging context?
- Is the intended submission a pure frontend demo, or should we later add a lightweight backend/model simulation?

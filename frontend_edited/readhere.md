changed app.js and dashboard.html(this file one only change the thresold value range)

#app.js — all changes from original
1. Backend connection added

API constant pointing to http://localhost:8000
CREDS with admin@muledetect.local / hackathon2026
getToken() — logs in, gets JWT
apiFetch() — wrapper for all authenticated API calls

2. Mock data kept as fallback

All original clusters, nodes, edges renamed to MOCK_CLUSTERS, MOCK_NODES, MOCK_EDGES
Used automatically if backend is unreachable

3. Data mapping functions

mapCluster() — converts backend fields (member_count, total_flow, risk_score, pattern_flags) to what the UI expects
getClusterGraph() — filters graph nodes/edges by cluster_id for the active cluster, lays them out with sources left, collector center, mules right
applyReport() — maps AI report fields (summary, risk_rationale, recommended_action, pattern_detected, confidence, action_rationale) onto the cluster

4. loadFromBackend()

Calls /api/clusters, /api/graph, then /api/cluster/{id}/report for top cluster
Stores all graph nodes/edges in allGraphNodes / allGraphEdges
Sets selectedNode per cluster = highest scoring node in that cluster

5. refreshReport() with polling

Polls /api/cluster/{id}/report every 10 seconds up to 8 attempts
Handles "generating" status — logs progress in Decision History
Throws timeout error after ~80 seconds so button never gets permanently stuck

6. Default threshold changed

From 70 → 20 so all 3 real clusters (scores 55, 35, 29) show in the queue

7. Graph switches per cluster

updateActiveGraph() called when clicking a cluster in the queue
Re-syncs activeNode to highest risk node in the new cluster

8. Startup sequence fixed

Shows mock data instantly on load
Replaces with real cluster data as soon as backend responds
AI report loads silently in background — doesn't block the UI

9. Live API badge

Green ● Live API badge in top bar when connected to backend
Yellow ● Demo mode badge when backend is unreachable

10. Refresh button fixed

Wrapped in try/catch so it always re-enables after success or failure
Shows "Report timed out — rate limited. Try again in 30s." if polling exhausted


#dashboard.html — one line changed
Line 64, the threshold slider:

min="35" → min="10"
value="70" → value="20"

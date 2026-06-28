// =============================================
// MULEPULSE — DASHBOARD APP
// Backend: http://localhost:8000
// =============================================

const API = "http://localhost:8000";
const CREDS = { username: "admin@muledetect.local", password: "hackathon2026" };

// Fallback mock data used if backend is unreachable
const MOCK_CLUSTERS = [
  {
    id: "MN-042", name: "Bukit Jalil split chain", risk: 91, accounts: 18,
    amount: 482000, window: "22 min", recommendation: "Freeze", selectedNode: "A104",
    explanation: "Account A104 received funds from 14 distinct sources within 18 minutes, then forwarded 92% of the balance to three downstream accounts. Two downstream nodes are within one hop of a known mule account.",
    features: [["Many senders at once","14 sources / 18 min"],["Money moved quickly","92% forwarded / 11 min"],["Near a known mule","1 hop"],["Network tightness","0.74"]],
  },
  {
    id: "MN-031", name: "Johor device overlap ring", risk: 84, accounts: 11,
    amount: 216000, window: "47 min", recommendation: "Escalate", selectedNode: "B221",
    explanation: "Several accounts share device and recipient overlap while distributing funds to the same cash-out endpoints.",
    features: [["Shared devices","5 accounts"],["Unusual spreading","6.3x baseline"],["Little money left behind","8% median"],["Repeated recipients","4 endpoints"]],
  },
  {
    id: "MN-027", name: "Klang rapid pass-through", risk: 76, accounts: 9,
    amount: 155000, window: "1h 12m", recommendation: "Escalate", selectedNode: "C088",
    explanation: "Inbound DuitNow transfers move through a short chain with unusually low waiting time.",
    features: [["Typical waiting time","17 min"],["Chain depth","4 hops"],["Split transfers","21 transfers"],["New account share","67%"]],
  },
  {
    id: "MN-019", name: "Penang watch cluster", risk: 63, accounts: 7,
    amount: 86000, window: "2h 4m", recommendation: "Monitor", selectedNode: "D014",
    explanation: "This cluster shows early collection behavior and many new accounts, but the pass-through pattern is not yet strong enough for a freeze recommendation.",
    features: [["Sender count","6 accounts"],["Money movement speed","38 min"],["Known mule distance","3 hops"],["Network tightness","0.41"]],
  },
];

const MOCK_NODES = [
  { id: "V001", label: "Sender A",  x: 70,  y: 100, type: "source",  risk: 38 },
  { id: "V002", label: "Sender B",  x: 80,  y: 210, type: "source",  risk: 31 },
  { id: "V003", label: "Sender C",  x: 95,  y: 325, type: "source",  risk: 34 },
  { id: "A104", label: "A104",      x: 280, y: 215, type: "risk",    risk: 94 },
  { id: "A118", label: "A118",      x: 445, y: 105, type: "watch",   risk: 74 },
  { id: "A173", label: "A173",      x: 455, y: 230, type: "risk",    risk: 89 },
  { id: "A199", label: "A199",      x: 440, y: 345, type: "watch",   risk: 69 },
  { id: "K777", label: "K777",      x: 640, y: 165, type: "known",   risk: 98 },
  { id: "CASH", label: "Cash-out",  x: 650, y: 315, type: "cashout", risk: 82 },
];

const MOCK_EDGES = [
  ["V001","A104","RM42k",true], ["V002","A104","RM31k",true], ["V003","A104","RM28k",true],
  ["A104","A118","RM92k",true], ["A104","A173","RM84k",true], ["A104","A199","RM67k",true],
  ["A118","K777","RM73k",false],["A173","K777","RM81k",true], ["A199","CASH","RM55k",false],
];

// =============================================
// BACKEND — AUTH + DATA FETCHING
// =============================================

let token = null;
let usingLiveData = false;
let allGraphNodes = [];
let allGraphEdges = [];

async function getToken() {
  try {
    const form = new URLSearchParams();
    form.append("username", CREDS.username);
    form.append("password", CREDS.password);
    const res = await fetch(`${API}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch { return null; }
}

async function apiFetch(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

// Map backend cluster → frontend shape
// Real fields: id, risk_score (0-100), member_count, total_flow, pattern_flags, status
function mapCluster(c, index) {
  const score = Math.round(c.risk_score || 0);
  const flags = c.pattern_flags || {};
  const patterns = Object.entries(flags).filter(([,v]) => v).map(([k]) => k.replace(/_/g, " "));

  // Derive recommendation from score
  let recommendation = "Monitor";
  if (score >= 70) recommendation = "Freeze";
  else if (score >= 50) recommendation = "Escalate";

  // Build a name from patterns
  const patternLabel = patterns.length ? patterns.slice(0,2).join(" + ") : "suspicious activity";
  const name = `Cluster ${index + 1} — ${patternLabel}`;

  return {
    id: c.id,
    name,
    risk: score,
    accounts: c.member_count || 0,
    amount: Math.round(c.total_flow || 0),
    window: "—",
    recommendation,
    selectedNode: null, // will be set after graph loads
    explanation: patterns.length
      ? `This cluster shows ${patterns.join(", ")} behaviour with ${c.member_count} accounts and ${c.known_mule_count || 0} known mule(s). Risk score: ${score}.`
      : `Risk score: ${score}. ${c.member_count} accounts involved.`,
    features: [
      ["Risk score", `${score} / 100`],
      ["Accounts", `${c.member_count}`],
      ["Known mules", `${c.known_mule_count || 0}`],
      ["Patterns", patterns.length ? patterns.join(", ") : "none detected"],
    ],
    _raw: c,
  };
}

// Map backend graph nodes/edges — filter to active cluster only
function getClusterGraph(clusterId) {
  const svgW = 760, svgH = 440;

  // Filter nodes for this cluster only
  const clusterNodes = allGraphNodes.filter(n => n.cluster_id === clusterId);
  const clusterNodeIds = new Set(clusterNodes.map(n => n.id));

  // Filter edges where both ends are in cluster
  const clusterEdges = allGraphEdges.filter(e =>
    clusterNodeIds.has(e.from) && clusterNodeIds.has(e.to)
  );

  if (!clusterNodes.length) return { nodes: MOCK_NODES, edges: MOCK_EDGES };

  // Layout: collector in center, sources left, mules right
  const collectors = clusterNodes.filter(n => n.label.toLowerCase().includes("collector"));
  const sources    = clusterNodes.filter(n => n.label.toLowerCase().includes("victim") || n.label.toLowerCase().includes("src"));
  const mules      = clusterNodes.filter(n => !collectors.includes(n) && !sources.includes(n));

  const cx = svgW / 2, cy = svgH / 2;
  const positioned = [];

  // Collector goes center
  collectors.forEach((n, i) => {
    positioned.push({ ...n, x: cx, y: cy + (i * 60) });
  });

  // Sources spread left
  sources.forEach((n, i) => {
    const total = sources.length;
    const ySpread = Math.min(300, total * 40);
    positioned.push({ ...n, x: 100, y: cy - ySpread/2 + (i / Math.max(total-1,1)) * ySpread });
  });

  // Mules spread right
  mules.forEach((n, i) => {
    const total = mules.length;
    const ySpread = Math.min(300, total * 40);
    positioned.push({ ...n, x: 620, y: cy - ySpread/2 + (i / Math.max(total-1,1)) * ySpread });
  });

  const mappedNodes = positioned.map(n => {
    const tier = (n.tier || "").toLowerCase();
    let type = "source";
    if (n.label.toLowerCase().includes("collector")) type = "risk";
    else if (n.known_mule) type = "known";
    else if (tier === "high") type = "risk";
    else if (tier === "elevated") type = "watch";
    else if (n.label.toLowerCase().includes("mule")) type = "watch";

    return {
      id: n.id,
      label: n.label.length > 12 ? n.label.slice(0, 12) : n.label,
      x: Math.round(n.x),
      y: Math.round(n.y),
      type,
      risk: n.score || 0,
    };
  });

  const mappedEdges = clusterEdges.map(e => {
    const amt = e.amount ? `RM${(e.amount/1000).toFixed(0)}k` : "";
    return [e.from, e.to, amt, true];
  });

  return { nodes: mappedNodes, edges: mappedEdges };
}

// Apply AI report data onto cluster
function applyReport(cluster, report) {
  if (!report || report.status !== "ready") return cluster;
  // Backend wraps report inside report.report
  const r = report.report || report;

  // Summary — use summary, fallback to timeline
  const summary = r.summary || r.timeline || "";
  const rationale = r.risk_rationale || "";
  if (summary) cluster.explanation = summary + (rationale ? " " + rationale : "");

  // Recommendation
  const rec = r.recommended_action || r.recommendation || "";
  if (rec) cluster.recommendation = rec.charAt(0).toUpperCase() + rec.slice(1).toLowerCase();

  // Key account node
  if (r.key_accounts && r.key_accounts.length) {
    cluster.selectedNode = r.key_accounts[0].account_id || cluster.selectedNode;
  }

  // Features from report
  const features = [];
  if (r.pattern_detected && r.pattern_detected.length)
    features.push(["Patterns", r.pattern_detected.join(", ")]);
  if (r.confidence != null)
    features.push(["AI confidence", `${Math.round(r.confidence * 100)}%`]);
  if (r.action_rationale)
    features.push(["Why this action", r.action_rationale]);
  if (r._model_used)
    features.push(["Model", r._model_used]);

  if (features.length) cluster.features = features;
  return cluster;
}

async function loadFromBackend() {
  token = await getToken();
  if (!token) return false;

  try {
    // Load clusters
    const raw = await apiFetch("/api/clusters");
    const list = raw.clusters || [];
    if (!list.length) return false;

    const mapped = list.map(mapCluster);
    mapped.sort((a, b) => b.risk - a.risk);
    clusters.length = 0;
    mapped.forEach(c => clusters.push(c));

    // Load full graph (store all, filter per cluster)
    try {
      const graphData = await apiFetch("/api/graph");
      allGraphNodes = graphData.nodes || [];
      allGraphEdges = graphData.edges || [];

      // Set selectedNode for each cluster = highest score node in that cluster
      clusters.forEach(c => {
        const clusterNodes = allGraphNodes.filter(n => n.cluster_id === c.id);
        if (clusterNodes.length) {
          const top = clusterNodes.sort((a, b) => (b.score||0) - (a.score||0))[0];
          c.selectedNode = top.id;
        }
      });
    } catch { /* graph optional */ }

    usingLiveData = true;
    return true;
  } catch { return false; }
}

async function refreshReport(cluster) {
  if (!token) return;
  const maxAttempts = 8; // max ~80 seconds
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const report = await apiFetch(`/api/cluster/${cluster.id}/report`);
      if (report.status === "ready") {
        applyReport(cluster, report);
        return;
      } else if (report.status === "generating") {
        appendLog(`AI report generating… (${i + 1}/${maxAttempts})`);
        renderLog();
        await new Promise(r => setTimeout(r, 10000));
      } else {
        appendLog("Report returned unexpected status.");
        return;
      }
    } catch (e) {
      appendLog("Report fetch error — retrying…");
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  appendLog("Report timed out — rate limited. Try again in 30s.");
  throw new Error("timeout");
}

// =============================================
// STATE
// =============================================

let clusters = [...MOCK_CLUSTERS];
let nodes    = [...MOCK_NODES];
let edges    = [...MOCK_EDGES];

const guideContent = {
  1: ["Spot the urgent case",  "MulePulse sorts suspicious clusters by network risk so a non-technical reviewer can start with the most urgent case first."],
  2: ["Follow the flow",       "The money-flow map shows how funds move from senders into a hub account, then out toward linked mule and cash-out accounts."],
  3: ["Read the reason",       "The explanation avoids model jargon and tells the reviewer what triggered concern: many sources, fast forwarding, and known mule proximity."],
  4: ["Approve action",        "The AI can recommend an action, but a person must choose monitor, escalate, or freeze. Every decision is logged for accountability."],
};

function nodeColor(type) {
  return { source:"#3b82f6", risk:"#ef4444", watch:"#f59e0b", known:"#8b5cf6", cashout:"#06b6d4" }[type] || "#4b5563";
}

function money(value) {
  if (value >= 1000000) return `RM ${(value/1e6).toFixed(2)}M`;
  return `RM ${(value/1000).toFixed(0)}k`;
}

// Default threshold = 20 so all real clusters (55, 35, 29) show up
let threshold     = 20;
let activeCluster = clusters[0];
let activeNode    = activeCluster.selectedNode;
let logItems = [
  ["09:42", "MulePulse reviewed 214 recent DuitNow transfers."],
  ["09:44", "One money-flow cluster became urgent enough for review."],
  ["09:46", "AI prepared a plain-language case file for human approval."],
];

// =============================================
// DOM REFS
// =============================================

const graph          = document.querySelector("#networkGraph");
const queue          = document.querySelector("#clusterQueue");
const thresholdRange = document.querySelector("#thresholdRange");
const thresholdValue = document.querySelector("#thresholdValue");
const flaggedCount   = document.querySelector("#flaggedCount");
const networkRisk    = document.querySelector("#networkRisk");
const alertVolume    = document.querySelector("#alertVolume");
const modelTradeoff  = document.querySelector("#modelTradeoff");
const caseDetails    = document.querySelector("#caseDetails");
const caseBadge      = document.querySelector("#caseBadge");
const explanationText= document.querySelector("#explanationText");
const featureList    = document.querySelector("#featureList");
const activityLog    = document.querySelector("#activityLog");
const guidedTitle    = document.querySelector("#guidedTitle");
const guidedText     = document.querySelector("#guidedText");

// =============================================
// RENDER FUNCTIONS
// =============================================

function appendLog(text) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  logItems.push([time, text]);
}

function updateActiveGraph() {
  if (usingLiveData && activeCluster) {
    const { nodes: n, edges: e } = getClusterGraph(activeCluster.id);
    nodes.length = 0; n.forEach(x => nodes.push(x));
    edges.length = 0; e.forEach(x => edges.push(x));
    // Set active node to highest risk node
    const top = nodes.filter(n => n.type === "risk")[0] || nodes[0];
    if (top) activeNode = top.id;
  }
}

function renderGraph() {
  if (!graph) return;
  graph.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10z" fill="rgba(41,141,255,0.8)"/>
      </marker>
    </defs>
  `;

  edges.forEach(([from, to, label, hot]) => {
    const src = nodes.find(n => n.id === from);
    const tgt = nodes.find(n => n.id === to);
    if (!src || !tgt) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", src.x); line.setAttribute("y1", src.y);
    line.setAttribute("x2", tgt.x); line.setAttribute("y2", tgt.y);
    line.setAttribute("class", hot ? "edge hot" : "edge");
    graph.appendChild(line);
    if (label) {
      const txt = document.createElementNS("http://www.w3.org/2000/svg","text");
      txt.setAttribute("x", (src.x+tgt.x)/2); txt.setAttribute("y", (src.y+tgt.y)/2-7);
      txt.setAttribute("fill","#4b6380"); txt.setAttribute("font-size","10");
      txt.setAttribute("font-weight","600"); txt.setAttribute("text-anchor","middle");
      txt.textContent = label;
      graph.appendChild(txt);
    }
  });

  nodes.forEach(node => {
    const g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.setAttribute("class", `node ${node.id === activeNode ? "selected" : ""}`);
    g.setAttribute("tabindex","0"); g.setAttribute("role","button");
    g.setAttribute("aria-label", `${node.label}, risk score ${node.risk}`);
    g.addEventListener("click", () => {
      activeNode = node.id;
      appendLog(`Reviewer selected account ${node.label} on the money-flow map.`);
      renderAll();
    });
    const r = node.id === activeNode ? 26 : 21;
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", node.x); circle.setAttribute("cy", node.y);
    circle.setAttribute("r", r); circle.setAttribute("fill", nodeColor(node.type));
    g.appendChild(circle);
    const lbl = document.createElementNS("http://www.w3.org/2000/svg","text");
    lbl.setAttribute("x", node.x); lbl.setAttribute("y", node.y+4);
    lbl.textContent = node.label;
    g.appendChild(lbl);
    graph.appendChild(g);
  });
}

function renderQueue() {
  if (!queue) return;
  const visible = clusters.filter(c => c.risk >= threshold);
  queue.innerHTML = "";
  if (!visible.length) {
    queue.innerHTML = `<p class="no-cases">No cases at this comfort level.</p>`;
    return;
  }
  visible.forEach(c => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cluster-item ${c.id === activeCluster.id ? "active" : ""}`;
    btn.setAttribute("role","listitem");
    btn.innerHTML = `
      <div class="cluster-top"><strong>${c.id.slice(0,8)}…</strong><span class="risk-score">${c.risk}</span></div>
      <div class="cluster-name">${c.name}</div>
      <div class="cluster-meta">
        <span>${c.accounts} accounts</span>
        <span>${money(c.amount)}</span>
        <span>${c.window}</span>
      </div>
    `;
    btn.addEventListener("click", () => {
      activeCluster = c;
      activeNode = c.selectedNode;
      appendLog(`Opened case ${c.id.slice(0,8)}: ${c.name}.`);
      updateActiveGraph();
      // Re-sync activeNode after graph update
      const topNode = nodes.filter(n => n.type === "risk")[0] || nodes[0];
      if (topNode) activeNode = topNode.id;
      renderAll();
    });
    queue.appendChild(btn);
  });
}

function renderCase() {
  if (!caseDetails || !caseBadge) return;
  const selected = nodes.find(n => n.id === activeNode);
  const recColor = { Freeze:"#ef4444", Escalate:"#f59e0b", Monitor:"#22c87a" }[activeCluster.recommendation] || "#298DFF";

  caseBadge.textContent = activeCluster.recommendation;
  caseBadge.style.background = recColor+"22";
  caseBadge.style.color      = recColor;
  caseBadge.style.border     = `1px solid ${recColor}44`;

  const displayId = activeCluster.id.length > 20 ? activeCluster.id : activeCluster.id;
  caseDetails.innerHTML = `
    <p class="case-summary">${activeCluster.name} looks like a coordinated mule network with urgency score ${activeCluster.risk}. ${selected ? `Account ${selected.label}` : "Key account"} is selected for review.</p>
    <div class="case-stat-row"><span>Case ID</span><strong style="font-size:11px">${displayId}</strong></div>
    <div class="case-stat-row"><span>Accounts involved</span><strong>${activeCluster.accounts}</strong></div>
    <div class="case-stat-row"><span>Money exposed</span><strong>${money(activeCluster.amount)}</strong></div>
    <div class="case-stat-row"><span>Activity window</span><strong>${activeCluster.window}</strong></div>
    <div class="case-stat-row"><span>Suggested action</span><strong style="color:${recColor}">${activeCluster.recommendation}</strong></div>
  `;

  if (explanationText) explanationText.textContent = activeCluster.explanation;
  if (featureList) {
    featureList.innerHTML = activeCluster.features
      .map(([lbl,val]) => `<div class="feature"><span>${lbl}</span><strong>${val}</strong></div>`)
      .join("");
  }
}

function renderMetrics() {
  const visible  = clusters.filter(c => c.risk >= threshold);
  const highest  = visible.length ? Math.max(...visible.map(c => c.risk)) : 0;
  const totalAmt = visible.reduce((sum,c) => sum+c.amount, 0);
  if (networkRisk)  networkRisk.textContent  = highest;
  if (flaggedCount) flaggedCount.textContent = visible.length;
  const fundsEl = document.querySelector("#fundsAtRisk");
  if (fundsEl) fundsEl.textContent = money(totalAmt);
  const alertEst  = Math.max(8, Math.round(76-threshold*0.48));
  const recall    = Math.max(55, Math.round(109-threshold*0.33));
  const precision = Math.min(92, Math.round(36+threshold*0.5));
  if (alertVolume)   alertVolume.textContent   = `${alertEst} cases/day`;
  if (modelTradeoff) modelTradeoff.textContent = recall>84 ? "Catches more fraud · more cases" : precision>76 ? "Fewer cases · stricter list" : "Balanced coverage · manageable";
}

function renderLog() {
  if (!activityLog) return;
  activityLog.innerHTML = logItems.slice(-6).reverse()
    .map(([t,txt]) => `<li><time>${t}</time><span>${txt}</span></li>`)
    .join("");
}

function renderDataBadge() {
  const topbar = document.querySelector(".topbar-right");
  if (!topbar) return;
  const existing = document.querySelector("#data-badge");
  if (existing) existing.remove();
  const badge = document.createElement("span");
  badge.id = "data-badge";
  badge.style.cssText = "font-size:11px;padding:3px 8px;border-radius:999px;margin-right:8px;" +
    (usingLiveData
      ? "background:#22c87a22;color:#22c87a;border:1px solid #22c87a44;"
      : "background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b44;");
  badge.textContent = usingLiveData ? "● Live API" : "● Demo mode";
  topbar.prepend(badge);
}

function renderAll() {
  if (thresholdRange) thresholdRange.value = threshold;
  if (thresholdValue) thresholdValue.textContent = threshold;
  renderMetrics();
  renderQueue();
  renderGraph();
  renderCase();
  renderLog();
  renderDataBadge();
}

// =============================================
// EVENT LISTENERS
// =============================================

if (thresholdRange) {
  thresholdRange.addEventListener("input", e => {
    threshold = Number(e.target.value);
    renderAll();
  });
}

const runAgentBtn = document.querySelector("#runAgent");
if (runAgentBtn) {
  runAgentBtn.addEventListener("click", async () => {
    runAgentBtn.textContent = "Loading report…";
    runAgentBtn.disabled = true;

    try {
      if (usingLiveData) {
        await refreshReport(activeCluster);
        appendLog(`AI report loaded for ${activeCluster.id.slice(0,8)}.`);
      } else {
        appendLog(`MulePulse refreshed the case file.`);
      }
    } catch (e) {
      appendLog("Report load failed — try again in 30s.");
    }

    updateActiveGraph();
    renderAll();
    runAgentBtn.textContent = "Refreshed ✓";
    runAgentBtn.style.color = "#22c87a";
    runAgentBtn.disabled = false;
    setTimeout(() => { runAgentBtn.textContent="Refresh AI case file"; runAgentBtn.style.color=""; }, 1500);
  });
}

document.querySelectorAll(".decision-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    appendLog(`Human reviewer selected ${btn.dataset.action} for ${activeCluster.id.slice(0,8)}.`);
    renderLog();
    btn.style.opacity = "0.5";
    setTimeout(() => { btn.style.opacity=""; }, 300);
  });
});

document.querySelectorAll(".guide-step").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".guide-step").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    const [title,text] = guideContent[btn.dataset.step];
    if (guidedTitle) guidedTitle.textContent = title;
    if (guidedText)  guidedText.textContent  = text;
    appendLog(`Demo guide step ${btn.dataset.step}: ${title}.`);
    renderLog();
  });
});

// =============================================
// INIT
// =============================================

(async () => {
  // Show mock data immediately so page is not blank
  renderAll();
  appendLog("Connecting to MulePulse backend…");
  renderLog();

  const ok = await loadFromBackend();
  if (ok) {
    activeCluster = clusters[0];
    updateActiveGraph();
    appendLog(`${clusters.length} live clusters loaded.`);
    renderAll(); // show real cluster data immediately, no waiting for reports

    // Load AI report for top cluster silently in background
    appendLog("Loading AI report for top cluster…");
    renderLog();
    refreshReport(activeCluster).then(() => {
      appendLog("AI report ready.");
      renderAll();
    });
  } else {
    appendLog("Backend unavailable — running in demo mode.");
    renderAll();
  }
})();